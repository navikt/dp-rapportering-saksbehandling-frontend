import { type ActionFunctionArgs, redirect } from "react-router";
import { uuidv7 } from "uuidv7";

import { korrigerPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { getABTestVariant } from "~/utils/ab-test.server";
import { QUERY_PARAMS } from "~/utils/constants";
import type {
  IKorrigerMeldekort,
  IRapporteringsperiodeDag,
  ISendInnMeldekort,
} from "~/utils/types";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;
  const personId = formData.get("personId") as string;
  const periode = JSON.parse(rapporteringsperiode);

  let oppdatertId: string;

  // Sjekk om dette er en oppdatering (ISendInnMeldekort) eller korrigering (IKorrigerMeldekort)
  // ISendInnMeldekort har registrertArbeidssoker (boolean, aldri null)
  // IKorrigerMeldekort har originalMeldekortId (string)
  const erKorrigering = typeof periode.originalMeldekortId === "string";
  const erOppdatering = !erKorrigering;

  if (erOppdatering) {
    // Dette er en oppdatering av et meldekort som er TilUtfylling
    const oppdatertPeriode: ISendInnMeldekort = periode;

    await oppdaterPeriode({
      periode: oppdatertPeriode,
      personId,
      request,
    });

    oppdatertId = periode.id;
  } else {
    // Dette er en korrigering av et innsendt meldekort
    // Frontend sender allerede IKorrigerMeldekort, men vi må generere nye aktivitet-IDer
    const korrigertPeriode: IKorrigerMeldekort = {
      ...periode,
      dager: periode.dager.map((dag: IRapporteringsperiodeDag) => ({
        ...dag,
        // Databasen krever en unik ID for hver aktivitet, og vi kan ikke gjenbruke orginal ID ved korrigering
        aktiviteter: dag.aktiviteter.map((aktivitet) => ({ ...aktivitet, id: uuidv7() })),
      })),
    };

    const nyMeldekortId = await korrigerPeriode({
      periode: korrigertPeriode,
      personId,
      request,
    });

    // brukes for å visuelt highlighte meldekortet som har blitt sendt inn i periodelisten
    oppdatertId = nyMeldekortId || periode.originalMeldekortId;
  }

  // ta vare på variant fra AB-testen ved redirect
  const variant = getABTestVariant(request);
  const url = new URL(`/person/${personId}/perioder`, request.url);
  url.searchParams.set(
    QUERY_PARAMS.AAR,
    new Date(periode.periode.fraOgMed).getFullYear().toString(),
  );
  url.searchParams.set(QUERY_PARAMS.RAPPORTERINGSID, oppdatertId);
  url.searchParams.set(QUERY_PARAMS.OPPDATERT, oppdatertId);
  if (variant) {
    url.searchParams.set("variant", variant);
  }

  return redirect(url.pathname + url.search);
}
