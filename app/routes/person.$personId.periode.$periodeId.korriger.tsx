import { Heading, Tag } from "@navikt/ds-react";
import { useState } from "react";
import { useLoaderData, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { Korrigering } from "~/components/korrigering/Korrigering";
import { Forhandsvisning } from "~/components/rapporteringsperiode-visning/Forhandsvisning";
import { PeriodeMedUke } from "~/components/rapporteringsperiode-visning/PeriodeMedUke";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import type { loader as personLoader } from "~/routes/person.$personId";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, ISaksbehandler } from "~/utils/types";

import type { Route } from "../+types/root";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ periode: IRapporteringsperiode; saksbehandler: ISaksbehandler }> {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periode = await hentPeriode(request, params.periodeId);
  const saksbehandler = await hentSaksbehandler(request);

  // TODO: Håndter feil i hentPeriode
  return { periode, saksbehandler };
}

export default function Periode() {
  const { periode, saksbehandler } = useLoaderData<typeof loader>();
  const personData = useRouteLoaderData<typeof personLoader>("routes/person.$personId");

  const [korrigertPeriode, setKorrigertPeriode] = useState<IRapporteringsperiode>(periode);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  if (!personData?.person) {
    return <div>Persondata ikke funnet</div>;
  }

  return (
    <div className={styles.rapporteringsperiode}>
      <div className={styles.grid}>
        <Heading level="2" size="medium" className={styles.periodeOverskrift}>
          Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
        </Heading>
        <div className={styles.uendretPeriode}>
          <div className={styles.periodeOgTag}>
            <PeriodeMedUke periode={periode} />
            <Tag variant="info" size="small">
              Sist beregnet
            </Tag>
          </div>
          <Forhandsvisning periode={periode} />
          {periode.begrunnelse && (
            <div className={styles.begrunnelseVisning}>
              <Heading level="4" size="small">
                Begrunnelse for korrigering
              </Heading>
              <p>{periode.begrunnelse}</p>
            </div>
          )}
        </div>
        <div className={styles.endretPeriode}>
          <div className={styles.periodeOgTag}>
            <PeriodeMedUke periode={periode} />
            <Tag variant="info" size="small">
              Korrigering
            </Tag>
          </div>
          <Forhandsvisning periode={korrigertPeriode} />
        </div>
      </div>
      <div className={styles.korrigering}>
        <Korrigering
          korrigertPeriode={korrigertPeriode}
          setKorrigertPeriode={setKorrigertPeriode}
          originalPeriode={periode}
          person={personData.person}
          saksbehandler={saksbehandler}
        />
      </div>
    </div>
  );
}
