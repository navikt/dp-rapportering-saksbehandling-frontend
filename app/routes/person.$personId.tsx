import { Outlet, redirect, useLoaderData } from "react-router";

import PersonInformasjon from "~/components/header-meny/PersonInformasjon";
import { hentPerson } from "~/models/person.server";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/perioder`);
  }

  const person = await hentPerson(request, params.personId);

  return { person };
}

export default function Rapportering() {
  const { person } = useLoaderData<typeof loader>();

  return (
    <>
      <PersonInformasjon person={person} />
      <Outlet />
    </>
  );
}
