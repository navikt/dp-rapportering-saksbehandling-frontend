import classNames from "classnames";
import { useRouteLoaderData, useSearchParams } from "react-router";

import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeListeByYear } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
import styles from "~/route-styles/person.module.css";
import type { loader as personLoader } from "~/routes/person.$personId";
import { ANSVARLIG_SYSTEM } from "~/utils/constants";
import { sorterMeldekort } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/person.$personId.perioder";

export default function Rapportering({ params }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof personLoader>("routes/person.$personId");
  const perioder = data?.perioder ?? [];
  const person = data?.person ?? { ansvarligSystem: ANSVARLIG_SYSTEM.DP };

  const [searchParams] = useSearchParams();

  const valgteRapporteringsperiode =
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .map((id) => perioder.find((periode) => periode.id === id) as IRapporteringsperiode)
      .filter((periode) => periode)
      .sort(sorterMeldekort) ?? [];

  return (
    <>
      <div className={styles.rapporteringsperiodeListe}>
        <RapporteringsperiodeListeByYear
          perioder={perioder}
          personId={params.personId}
          ansvarligSystem={person?.ansvarligSystem}
        />
      </div>
      <section aria-label="Valgte perioder" className={styles.grid}>
        {valgteRapporteringsperiode.map((periode) => (
          <article
            key={periode.id}
            aria-label={`Periode ${periode.periode.fraOgMed}`}
            className={classNames(styles.periodeContainer, styles.fadeIn)}
          >
            <div className={styles.forhandsvisning}>
              <RapporteringsperiodeVisning perioder={[periode]} />
            </div>
            <div className={styles.detaljer}>
              <PeriodeDetaljer
                key={periode.id}
                periode={periode}
                personId={params.personId}
                ansvarligSystem={person?.ansvarligSystem}
              />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
