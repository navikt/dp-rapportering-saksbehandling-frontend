import { type ActionFunctionArgs, redirect } from "react-router";
import { uuidv7 } from "uuidv7";

import { korrigerPeriode } from "~/models/rapporteringsperiode.server";
import { QUERY_PARAMS, REFERRER as DEFAULT_REFERRER } from "~/utils/constants";
import type { IKorrigerMeldekort, IRapporteringsperiodeDag } from "~/utils/types";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;
  const personId = formData.get("personId") as string;
  const referrer = (formData.get("referrer") as string) || DEFAULT_REFERRER.PERIODER;
  const periode = JSON.parse(rapporteringsperiode);

  const korrigertPeriode: IKorrigerMeldekort = {
    ident: periode.ident,
    originalMeldekortId: periode.id,
    periode: periode.periode,
    dager: periode.dager.map((dag: IRapporteringsperiodeDag) => ({
      ...dag,
      // Databasen krever en unik ID for hver aktivitet, og vi kan ikke gjenbruke orginal ID ved korrigering
      aktiviteter: dag.aktiviteter.map((aktivitet) => ({ ...aktivitet, id: uuidv7() })),
    })),
    kilde: periode.kilde,
    begrunnelse: periode.begrunnelse,
    meldedato: periode.meldedato,
  };

  const nyMeldekortId = await korrigerPeriode({
    periode: korrigertPeriode,
    personId,
    request,
  });

  // Use the new corrected period ID for highlighting, fallback to original ID
  const oppdatertId = nyMeldekortId || periode.id;

  return redirect(
    `/person/${personId}/${referrer}?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${oppdatertId}&${QUERY_PARAMS.OPPDATERT}=${oppdatertId}`,
  );
}
