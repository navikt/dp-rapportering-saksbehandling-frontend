import { Outlet, useLoaderData } from "react-router";

import PersonInformasjon from "~/components/header-meny/PersonInformasjon";
import { hentPerson } from "~/models/person.server";
import type { IPerson } from "~/utils/types";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs): Promise<{ person: IPerson }> {
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
