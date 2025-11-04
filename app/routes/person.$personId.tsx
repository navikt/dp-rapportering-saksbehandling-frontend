import { Outlet, redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import Personlinje from "~/components/personlinje/Personlinje";
import { VariantSwitcher } from "~/components/variant-switcher/VariantSwitcher";
import { hentPerson } from "~/models/person.server";
import {
  hentArbeidssokerperioder,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import styles from "~/styles/route-styles/root.module.css";
import { isABTestingEnabled } from "~/utils/ab-test.server";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/perioder`);
  }

  invariant(params.personId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const person = await hentPerson(request, params.personId);
  const perioder = await hentRapporteringsperioder(request, params.personId);
  const arbeidssokerperioder = await hentArbeidssokerperioder(request, params.personId);
  const showABTesting = isABTestingEnabled();

  return { person, perioder, arbeidssokerperioder, showABTesting };
}

export default function Rapportering() {
  const { person, perioder, arbeidssokerperioder, showABTesting } = useLoaderData<typeof loader>();

  return (
    <>
      <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
        <Personlinje
          person={person}
          perioder={perioder}
          arbeidssokerperioder={arbeidssokerperioder}
        />
      </aside>
      <main id="main-content" className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
        {showABTesting && (
          <aside className={styles.variantSwitcherContainer}>
            <VariantSwitcher />
          </aside>
        )}
      </main>
    </>
  );
}
