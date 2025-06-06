import { Fragment } from "react";
import { useRouteLoaderData, useSearchParams } from "react-router";

import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeListe } from "~/components/rapporteringsperiode-liste/PeriodeListe";
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
  const personId = params.personId;
  const perioder = await hentRapporteringsperioder(request, personId);

  return { perioder };
}

export default function Rapportering({ params }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof personLoader>("routes/person.$personId");
  const perioder = data?.perioder ?? [];

  const [searchParams] = useSearchParams();

  const rapporteringsidParam = searchParams.get("rapporteringsid");
  const idListe = rapporteringsidParam?.split(",") ?? [];

  const periodeMap = new Map(perioder.map((p) => [p.id, p]));

  const valgteRapporteringsperiode = idListe
    .map((id) => periodeMap.get(id))
    .filter((periode): periode is IRapporteringsperiode => !!periode)
    .sort((a, b) => {
      // Først sortér på fraOgMed dato (nyeste først) - matcher database
      const fraOgMedDiff =
        new Date(b.periode.fraOgMed).getTime() - new Date(a.periode.fraOgMed).getTime();
      if (fraOgMedDiff !== 0) {
        return fraOgMedDiff;
      }

      // Hvis samme periode-dato, sortér på mottattDato (nyeste først)
      const mottattDatoA = a.mottattDato ? new Date(a.mottattDato).getTime() : 0;
      const mottattDatoB = b.mottattDato ? new Date(b.mottattDato).getTime() : 0;
      const mottattDiff = mottattDatoB - mottattDatoA;
      if (mottattDiff !== 0) {
        return mottattDiff;
      }

      // Hvis samme mottattDato, prioritér korrigerte perioder (originalId !== null)
      const originalIdA = a.originalId ? 1 : 0;
      const originalIdB = b.originalId ? 1 : 0;
      return originalIdB - originalIdA;
    });

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
