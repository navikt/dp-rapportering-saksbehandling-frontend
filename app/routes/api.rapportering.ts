import { type ActionFunctionArgs, redirect } from "react-router";

import { korrigerPeriode } from "~/models/rapporteringsperiode.server";
import { QUERY_PARAMS } from "~/utils/constants";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;
  const personId = formData.get("personId") as string;

  const periode = JSON.parse(rapporteringsperiode);

  await korrigerPeriode({
    periode,
    personId,
    request,
  });

  return redirect(
    `/person/${personId}/perioder?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}&${QUERY_PARAMS.OPPDATERT}=${periode.id}`,
  );
}
