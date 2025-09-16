import { useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { RapporteringsperiodeListeByYear } from "~/components/rapporteringsperiode-liste/PeriodeListe";
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

  return (
    <div className={styles.rapporteringsperiodeListe} style={{ width: "100%", maxWidth: "none" }}>
      <RapporteringsperiodeListeByYear
        perioder={perioder}
        alternativVisning={true}
        personId={params.personId}
      />
    </div>
  );
}
