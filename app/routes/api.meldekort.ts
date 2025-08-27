import { type ActionFunctionArgs, data } from "react-router";

import { korrigerMeldekort } from "~/models/meldekort.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiode = formData.get("rapporteringsperiode") as string;

  const korrigertPeriode = await korrigerMeldekort(request, JSON.parse(rapporteringsperiode));

  return data(korrigertPeriode);
}
