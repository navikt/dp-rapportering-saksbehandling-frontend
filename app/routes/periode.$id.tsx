import { Tag } from "@navikt/ds-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { Korrigering } from "~/components/korrigering/Korrigering";
import { Forhandsvisning } from "~/components/rapporteringsperiode-visning/Forhandsvisning";
import { PeriodeMedUke } from "~/components/rapporteringsperiode-visning/PeriodeMedUke";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/route-styles/periode.module.css";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

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

  const [korrigerteDager, setKorrigerteDager] = useState<IRapporteringsperiodeDag[]>(periode.dager);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  // { periode: { dager: [], id: "" } }

  // { ...periode } => { dager: [], id: "" }

  // { dager: [], dager: ["hei"] }

  return (
    <div className={styles.rapporteringsperiode}>
      <h2>
        Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
      </h2>
      <div className={styles.grid}>
        <div className={styles.uendretPeriode}>
          <div className={styles.periodeOgTag}>
            <PeriodeMedUke periode={periode} />
            <Tag variant="neutral">Sist beregnet</Tag>
          </div>
          <Forhandsvisning periode={periode} />
        </div>
        <div className={styles.endretPeriode}>
          <div className={styles.periodeOgTag}>
            <PeriodeMedUke periode={periode} />
            <Tag variant="error">Korrigering</Tag>
          </div>
          <Forhandsvisning periode={{ ...periode, dager: korrigerteDager }} />
        </div>
        <div className={styles.korrigering}>
          <Korrigering korrigerteDager={korrigerteDager} setKorrigerteDager={setKorrigerteDager} />
        </div>
      </div>
    </div>
  );
}
