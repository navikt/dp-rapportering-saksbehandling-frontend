import { BodyShort, Button } from "@navikt/ds-react";

import aktivitetStyles from "~/styles/aktiviteter.module.css";
import {
  AKTIVITET_TYPE,
  aktivitetsTyper,
  ANSVARLIG_SYSTEM,
  RAPPORTERINGSPERIODE_STATUS,
} from "~/utils/constants";
import {
  DatoFormat,
  formatterDato,
  konverterFraISO8601Varighet,
  ukenummer,
} from "~/utils/dato.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { PeriodeDetaljer } from "../rapporteringsperiode-detaljer/PeriodeDetaljer";
import { KalenderTabell } from "../tabeller/kalender/KalenderTabell";
import styles from "./PeriodeVisning.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

function beregnTotalt(periode: IRapporteringsperiode, type: string) {
  return periode.dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((aktivitet) => aktivitet.type === type);
    if (!aktivitet) return sum;

    if (type === AKTIVITET_TYPE.Arbeid) {
      return sum + (konverterFraISO8601Varighet(aktivitet.timer || "PT0H") || 0);
    }

    return sum + 1;
  }, 0);
}

export function RapporteringsperiodeVisning({ perioder, personId, ansvarligSystem }: IProps) {
  return perioder.map((periode) => {
    const { fraOgMed, tilOgMed } = periode.periode;
    const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
    const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });
    const uker = ukenummer(periode);

    // Sjekk om meldekort er tomt/klar til utfylling
    const erTilUtfylling =
      periode.status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling && periode.kanSendes;

    if (erTilUtfylling) {
      const kanSendes = periode.kanSendes && ansvarligSystem === ANSVARLIG_SYSTEM.DP;
      return (
        <section key={periode.id} aria-labelledby={`periode-${periode.id}`} className={styles.root}>
          <div className={styles.innhold}>
            <div className={styles.tomtMeldekort}>
              <BodyShort>Dette meldekortet er ikke fylt ut enda.</BodyShort>
            </div>
            {kanSendes && (
              <div>
                <Button
                  as="a"
                  href={`/person/${personId}/periode/${periode.id}/fyll-ut`}
                  className={styles.korrigerKnapp}
                  size="small"
                >
                  Fyll ut meldekort
                </Button>
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <section key={periode.id} aria-labelledby={`periode-${periode.id}`} className={styles.root}>
        <div>
          <h3 id={`periode-${periode.id}`}>Uke {uker}</h3>
          <BodyShort size="small">
            <time dateTime={fraOgMed}>{formattertFraOgMed}</time> -{" "}
            <time dateTime={tilOgMed}>{formattertTilOgMed}</time>
          </BodyShort>
        </div>
        <div className={styles.innhold}>
          <div className={styles.kalenderOgSammenlagt}>
            <KalenderTabell periode={periode} />
            <div className={styles.sammenlagt}>
              <h4 id={`sammenlagt-${periode.id}`}>Sammenlagt for perioden</h4>
              <ul className={styles.aktivitetListe} aria-labelledby={`sammenlagt-${periode.id}`}>
                {aktivitetsTyper.map(({ type, label, erDager, klasse }) => {
                  const total = beregnTotalt(periode, type);
                  const enhet = erDager ? "dager" : "timer";

                  return (
                    <li
                      key={type}
                      className={`${styles.aktivitet} ${aktivitetStyles[klasse]}`}
                      aria-label={`${label}: ${total} ${enhet}`}
                    >
                      <span aria-hidden="true">{label}</span>
                      <span aria-hidden="true">
                        {total} {enhet}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div>
            <PeriodeDetaljer
              key={periode.id}
              periode={periode}
              personId={personId}
              ansvarligSystem={ansvarligSystem}
            />
          </div>
        </div>
      </section>
    );
  });
}
