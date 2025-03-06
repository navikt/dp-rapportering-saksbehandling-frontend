import { useLoaderData, useSearchParams } from "react-router";

import { MeldekortListe } from "~/components/meldekort-liste/MeldekortListe";
import { MeldekortVisning } from "~/components/meldekort-visning/MeldekortVisning";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import styles from "~/route-styles/rapportering.module.css";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/behandling.$id";

export async function loader({
  request,
}: Route.LoaderArgs): Promise<{ perioder: IRapporteringsperiode[] }> {
  const perioder = await hentRapporteringsperioder(request);
  // TODO: Håndter feil i hentRapporteringsperioder
  return { perioder };
}

export default function Rapportering() {
  const { perioder } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const valgteMeldekort =
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .map((id) => perioder.find((periode) => periode.id === id) as IRapporteringsperiode)
      .filter((periode) => periode) ?? [];

  return (
    <div className={styles.grid}>
      <div className={styles.meldekortListe}>
        <MeldekortListe perioder={perioder} />
      </div>
      <div className={styles.visning}>
        <MeldekortVisning perioder={valgteMeldekort} />
      </div>
      <div className={styles.detaljer}>detaljer</div>
    </div>
  );
}
