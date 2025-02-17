import { MeldekortListe } from "~/components/meldekort-liste/MeldekortListe";
import type { Route } from "./+types/home";
import rapporteringsperioder from "~/mocks/responses/rapporteringsperioder";
import type { IRapporteringsperiode } from "~/utils/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader({
  request,
}: Route.ClientLoaderArgs): Promise<IRapporteringsperiode[]> {
  return rapporteringsperioder;
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const perioder = loaderData as unknown as IRapporteringsperiode[];

  return <MeldekortListe perioder={perioder} />;
}
