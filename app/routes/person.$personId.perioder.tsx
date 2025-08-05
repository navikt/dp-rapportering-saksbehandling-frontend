import { useRouteLoaderData, useSearchParams } from "react-router";
import invariant from "tiny-invariant";

import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeListeByYear } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import styles from "~/route-styles/person.module.css";
import type { loader as personLoader } from "~/routes/person.$personId";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/person.$personId.perioder";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ perioder: IRapporteringsperiode[] }> {
  invariant(params.personId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const perioder = await hentRapporteringsperioder(request, params.personId);

  return { perioder };
}

export default function Rapportering({ params }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof personLoader>("routes/person.$personId");
  const perioder = data?.perioder ?? [];

  const [searchParams] = useSearchParams();

  const valgteRapporteringsperiode =
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .map((id) => perioder.find((periode) => periode.id === id) as IRapporteringsperiode)
      .filter((periode) => periode) ?? [];

  return (
    <>
      <div className={styles.rapporteringsperiodeListe}>
        <RapporteringsperiodeListeByYear perioder={perioder} />
      </div>
      <div className={styles.grid}>
        {valgteRapporteringsperiode.map((periode) => (
          <div key={periode.id} className={`${styles.periodeContainer} ${styles.fadeIn}`}>
            <div className={styles.forhandsvisning}>
              <RapporteringsperiodeVisning perioder={[periode]} />
            </div>
            <div className={styles.detaljer}>
              <PeriodeDetaljer key={periode.id} periode={periode} personId={params.personId} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
