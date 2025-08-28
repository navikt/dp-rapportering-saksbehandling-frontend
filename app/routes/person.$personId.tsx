import { Outlet, redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import PersonInformasjon from "~/components/header-meny/PersonInformasjon";
import { hentRapporteringsperioder } from "~/models/meldekort.server";
import { hentPerson } from "~/models/person.server";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/meldekort`);
  }

  invariant(params.personId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const person = await hentPerson(request, params.personId);
  const perioder = await hentRapporteringsperioder(request, params.personId);

  return { person, perioder };
}

export default function Rapportering() {
  const { person, perioder } = useLoaderData<typeof loader>();

  return (
    <>
      <PersonInformasjon person={person} perioder={perioder} />
      <Outlet />
    </>
  );
}
