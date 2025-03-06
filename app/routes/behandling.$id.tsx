import { useLoaderData, useSearchParams } from "react-router";

import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeListe } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
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
  const valgteRapporteringsperiode =
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .map((id) => perioder.find((periode) => periode.id === id) as IRapporteringsperiode)
      .filter((periode) => periode) ?? [];

  const valgtId = searchParams.get("valgtId");
  const valgtPeriode = perioder.find((periode) => periode.id === valgtId);

  return (
    <div className={styles.grid}>
      <div className={styles.rapporteringsperiodeListe}>
        <RapporteringsperiodeListe perioder={perioder} />
      </div>
      <div className={styles.visning}>
        <RapporteringsperiodeVisning perioder={valgteRapporteringsperiode} />
      </div>
      <div className={styles.detaljer}>
        {valgtPeriode && <PeriodeDetaljer periode={valgtPeriode} />}
      </div>
    </div>
  );
}
