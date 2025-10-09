import { BodyLong, Heading } from "@navikt/ds-react";

import aktivitetStyles from "~/styles/aktiviteter.module.css";
import { AKTIVITET_TYPE, aktivitetsTyper } from "~/utils/constants";
import { konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Kalender } from "../../../tabeller/kalender/Kalender";
import styles from "./kalenderOgAktiviteter.module.css";

interface IProps {
  periode: IRapporteringsperiode;
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

export function KalenderOgAktiviteter({ periode }: IProps) {
  return (
    <div className={styles.kalenderOgSammenlagt}>
      <Kalender periode={periode} />
      <div className={styles.sammenlagt} id={`sammenlagt-${periode.id}`}>
        <Heading level="4" size="xsmall">
          Sammenlagt for perioden
        </Heading>
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
                <BodyLong aria-hidden="true" size="small">
                  {label}
                </BodyLong>
                <BodyLong aria-hidden="true" size="small">
                  {total} {enhet}
                </BodyLong>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
