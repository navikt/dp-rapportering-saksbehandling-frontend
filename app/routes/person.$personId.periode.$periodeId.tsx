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

import type { Route } from "./+types/person.$personId.periode.$periodeId";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ periode: IRapporteringsperiode }> {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periode = await hentPeriode(request, params.periodeId);

  // TODO: Håndter feil i hentPeriode
  return { periode };
}

export default function Periode() {
  const { periode } = useLoaderData<typeof loader>();

  const [korrigerteDager, setKorrigerteDager] = useState<IRapporteringsperiodeDag[]>(periode.dager);
  const [korrigertBegrunnelse, setKorrigertBegrunnelse] = useState<string>("");

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  return (
    <div className={styles.rapporteringsperiode}>
      <div className={styles.grid}>
        <h2 className={styles.periodeOverskrift}>
          Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
        </h2>
        <div className={styles.uendretPeriode}>
          <div className={styles.periodeOgTag}>
            <PeriodeMedUke periode={periode} />
            <Tag variant="info">Sist beregnet</Tag>
          </div>
          <Forhandsvisning periode={periode} />
          {periode.begrunnelseEndring && (
            <div className={styles.begrunnelseVisning}>
              <h4>Begrunnelse for korrigering</h4>
              <p>{periode.begrunnelseEndring}</p>
            </div>
          )}
        </div>
        <div className={styles.endretPeriode}>
          <div className={styles.periodeOgTag}>
            <PeriodeMedUke periode={periode} />
            <Tag variant="info">Korrigering</Tag>
          </div>
          <Forhandsvisning
            periode={{
              ...periode,
              dager: korrigerteDager,
              begrunnelseEndring: korrigertBegrunnelse,
            }}
          />
          <div className={styles.begrunnelseVisning}>
            <h4>Saksbehandlers begrunnelse for korrigering</h4>
            <p className={!korrigertBegrunnelse ? styles.obligatorisk : ""}>
              {korrigertBegrunnelse || "Obligatorisk"}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.korrigering}>
        <Korrigering
          korrigerteDager={korrigerteDager}
          setKorrigerteDager={setKorrigerteDager}
          originalPeriode={periode}
          setKorrigertBegrunnelse={setKorrigertBegrunnelse}
          korrigertBegrunnelse={korrigertBegrunnelse}
        />
      </div>
    </div>
  );
}
