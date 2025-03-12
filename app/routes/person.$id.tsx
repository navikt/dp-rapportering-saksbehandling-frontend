import { useLoaderData, useSearchParams } from "react-router";

import PersonInformasjon from "~/components/header-meny/PersonInformasjon";
import { PeriodeDetaljer } from "~/components/rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeListe } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
import { hentPerson } from "~/models/person.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import styles from "~/route-styles/rapportering.module.css";
import type { IPerson, IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/person.$id";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ perioder: IRapporteringsperiode[]; person: IPerson }> {
  const perioder = await hentRapporteringsperioder(request);
  const person = await hentPerson(request, params.id);
  // TODO: Håndter feil i hentRapporteringsperioder
  return { perioder, person };
}

export default function Rapportering() {
  const { perioder, person } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const valgteRapporteringsperiode =
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .map((id) => perioder.find((periode) => periode.id === id) as IRapporteringsperiode)
      .filter((periode) => periode) ?? [];

  return (
    <>
      <PersonInformasjon person={person} />
      <div className={styles.rapporteringsperiodeListe}>
        <RapporteringsperiodeListe perioder={perioder} />
      </div>
      <div className={styles.grid}>
        {valgteRapporteringsperiode.map((periode) => (
          <>
            <div className={styles.forhandsvisning}>
              <RapporteringsperiodeVisning perioder={[periode]} />
            </div>
            <div className={styles.detaljer}>
              <PeriodeDetaljer key={periode.id} periode={periode} />
            </div>
          </>
        ))}
      </div>
    </>
  );
}
