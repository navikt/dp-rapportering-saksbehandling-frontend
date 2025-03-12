import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { EndretPeriode } from "~/components/korrigering/EndretPeriode";
import { UendretPeriode } from "~/components/korrigering/UendretPeriode";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/route-styles/periode.module.css";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ periode: IRapporteringsperiode }> {
  invariant(params.id, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periode = await hentPeriode(request, params.id);
  // TODO: Håndter feil i hentPeriode
  return { periode };
}

export default function Periode() {
  const { periode } = useLoaderData<typeof loader>();

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  return (
    <div className={styles.rapporteringsperiode}>
      <h2>
        Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
      </h2>
      <div className={styles.grid}>
        <div className={styles.uendretPeriode}>
          <UendretPeriode periode={periode} />
        </div>
        <div className={styles.endretPeriode}>
          <EndretPeriode periode={periode} />
        </div>
        <div className={styles.korrigering}>korrigering</div>
      </div>
    </div>
  );
}
