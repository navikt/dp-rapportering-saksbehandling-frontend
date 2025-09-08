import { type ActionFunctionArgs, redirect } from "react-router";
import { uuidv7 } from "uuidv7";

import { korrigerPeriode } from "~/models/rapporteringsperiode.server";
import { QUERY_PARAMS } from "~/utils/constants";
import type { IKorrigerMeldekort, IRapporteringsperiodeDag } from "~/utils/types";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;
  const personId = formData.get("personId") as string;
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

  await korrigerPeriode({
    periode: korrigertPeriode,
    personId,
    request,
  });

  return redirect(
    `/person/${personId}/perioder?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}&${QUERY_PARAMS.OPPDATERT}=${periode.id}`,
  );
}
