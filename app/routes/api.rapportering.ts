import { type ActionFunctionArgs, data } from "react-router";

import { korrigerPeriode } from "~/models/rapporteringsperiode.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;

  const korrigertPeriode = await korrigerPeriode(request, JSON.parse(rapporteringsperiode));

  return data(korrigertPeriode);
}
