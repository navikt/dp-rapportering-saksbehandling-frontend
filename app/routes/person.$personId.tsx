import { Outlet, redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import Personlinje from "~/components/personlinje/Personlinje";
import { hentPerson } from "~/models/person.server";
import {
  hentArbeidssokerperioder,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import styles from "~/styles/route-styles/root.module.css";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/perioder`);
  }

  invariant(params.personId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const person = await hentPerson(request, params.personId);
  const perioder = await hentRapporteringsperioder(request, params.personId);
  const arbeidssokerperioder = await hentArbeidssokerperioder(request, params.personId);

  return { person, perioder, arbeidssokerperioder };
}

export default function Rapportering() {
  const { person, perioder, arbeidssokerperioder } = useLoaderData<typeof loader>();

  return (
    <>
      <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
        <Personlinje
          person={person}
          perioder={perioder}
          arbeidssokerperioder={arbeidssokerperioder}
        />
      </aside>
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
