import { Outlet, redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import PersonInformasjon from "~/components/header-meny/PersonInformasjon";
import { hentPerson } from "~/models/person.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";

import styles from "../route-styles/root.module.css";
import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/perioder`);
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
      <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
        <PersonInformasjon person={person} perioder={perioder} />
      </aside>
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
