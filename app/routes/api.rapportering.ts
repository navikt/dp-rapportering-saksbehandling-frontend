import { type ActionFunctionArgs, redirect } from "react-router";

import { korrigerPeriode } from "~/models/rapporteringsperiode.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;
  const personId = formData.get("personId") as string;

  const periode = JSON.parse(rapporteringsperiode);

  await korrigerPeriode({
    request,
    periode,
    personId,
  });

  return redirect(
    `/person/${personId}/perioder?aar=${new Date(periode.periode.fraOgMed).getFullYear()}&rapporteringsid=${periode.id}&oppdatert=${periode.id}`,
  );
}
