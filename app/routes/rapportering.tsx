import { MeldekortListe } from "~/components/meldekort-liste/MeldekortListe";
import type { Route } from "./+types/rapportering";
import rapporteringsperioder from "~/mocks/responses/rapporteringsperioder";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "~/route-styles/rapportering.module.css";

export async function loader({}: Route.LoaderArgs): Promise<IRapporteringsperiode[]> {
  return rapporteringsperioder;
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const perioder = loaderData as unknown as IRapporteringsperiode[];

  return (
    <div className={styles.grid}>
      <div className={styles.meldekortListe}>
        <MeldekortListe perioder={perioder} />
      </div>
      <div className={styles.visning}>visning</div>
      <div className={styles.detaljer}>detaljer</div>
    </div>
  );
}
