import { MeldekortListe } from "~/components/meldekort-liste/MeldekortListe";
import type { Route } from "./+types/rapportering";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "~/route-styles/rapportering.module.css";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ rapporteringsperioder: IRapporteringsperiode[] }> {
  const rapporteringsperioder = await hentRapporteringsperioder(request);
  console.log(params);

  // TODO: Håndter feil i hentRapporteringsperioder
  return { rapporteringsperioder };
}

export default function Index({ loaderData, params }: Route.ComponentProps) {
  const { rapporteringsperioder } = loaderData;

  console.log("params", params);

  return (
    <div className={styles.grid}>
      <div className={styles.meldekortListe}>
        <MeldekortListe perioder={rapporteringsperioder} />
      </div>
      <div className={styles.visning}>visning</div>
      <div className={styles.detaljer}>detaljer</div>
    </div>
  );
}
