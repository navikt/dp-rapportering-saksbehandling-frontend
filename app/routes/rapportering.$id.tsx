import { RapporteringsperiodeListe } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import type { Route } from "./+types/rapportering";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "~/route-styles/rapportering.module.css";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { useLoaderData, useSearchParams } from "react-router";
import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ perioder: IRapporteringsperiode[] }> {
  const perioder = await hentRapporteringsperioder(request);
  // TODO: Håndter feil i hentRapporteringsperioder
  return { perioder };
}

export default function Rapportering({ params }: Route.ComponentProps) {
  const { perioder } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const valgteRapporteringsperiode =
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .map((id) => perioder.find((periode) => periode.id === id) as IRapporteringsperiode)
      .filter((periode) => periode) ?? [];

  return (
    <div className={styles.grid}>
      <div className={styles.rapporteringsperiodeListe}>
        <RapporteringsperiodeListe perioder={perioder} />
      </div>
      <div
        className={`${styles.visning} ${
          valgteRapporteringsperiode.length === 0 ? styles.hidden : ""
        }`}
      >
        <h2>Forhåndsvisning</h2>
        <RapporteringsperiodeVisning perioder={valgteRapporteringsperiode} />
      </div>
      <div
        className={`${styles.detaljer} ${
          valgteRapporteringsperiode.length === 0 ? styles.hidden : ""
        }`}
      >
        <h2>Detaljer</h2>
        {valgteRapporteringsperiode.map((periode) => (
          <PeriodeDetaljer key={periode.id} periode={periode} />
        ))}
      </div>
    </div>
  );
}
