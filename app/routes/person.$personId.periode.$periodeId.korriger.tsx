import { BodyShort, Heading, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { useState } from "react";
import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { Korrigering } from "~/components/korrigering/Korrigering";
import { Forhandsvisning } from "~/components/rapporteringsperiode-visning/Forhandsvisning";
import { PeriodeMedUke } from "~/components/rapporteringsperiode-visning/PeriodeMedUke";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "../+types/root";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");
  const personId = params.personId;

  const periode = await hentPeriode<IRapporteringsperiode>(request, personId, params.periodeId);
  const saksbehandler = await hentSaksbehandler(request);

  // TODO: Håndter feil i hentPeriode
  return { periode, saksbehandler, personId };
}

export default function Periode() {
  const { periode, saksbehandler, personId } = useLoaderData<typeof loader>();

  const [korrigertPeriode, setKorrigertPeriode] = useState<IRapporteringsperiode>(periode);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  const erKorrigering = !!periode.originalMeldekortId;

  return (
    <div className={styles.rapporteringsperiode}>
      <div className={styles.grid}>
        <div className={classNames(styles.periodeOverskrift, styles.title)}>
          <Heading level="1" size="medium">
            Korriger meldekort
          </Heading>
          <BodyShort size="small">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </BodyShort>
        </div>
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
                Begrunnelse for {erKorrigering ? "korrigering" : "innsending"}
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
          personId={personId}
          saksbehandler={saksbehandler}
        />
      </div>
    </div>
  );
}
