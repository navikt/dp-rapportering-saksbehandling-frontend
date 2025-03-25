import { Fragment } from "react";
import { useLoaderData, useSearchParams } from "react-router";

import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeListe } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import styles from "~/route-styles/person.module.css";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/person.$personId.perioder";

export async function loader({
  request,
}: Route.LoaderArgs): Promise<{ perioder: IRapporteringsperiode[] }> {
  const perioder = await hentRapporteringsperioder(request);
  // TODO: Håndter feil i hentRapporteringsperioder
  return { perioder };
}

export default function Rapportering({ params }: Route.ComponentProps) {
  const { perioder } = useLoaderData<typeof loader>();
  console.log(perioder);
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
        <RapporteringsperiodeListe perioder={perioder} />
      </div>
      <div className={styles.grid}>
        {valgteRapporteringsperiode.map((periode) => (
          <Fragment key={periode.id}>
            <div className={styles.forhandsvisning}>
              <RapporteringsperiodeVisning perioder={[periode]} />
            </div>
            <div className={styles.detaljer}>
              <PeriodeDetaljer key={periode.id} periode={periode} personId={params.personId} />
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}
