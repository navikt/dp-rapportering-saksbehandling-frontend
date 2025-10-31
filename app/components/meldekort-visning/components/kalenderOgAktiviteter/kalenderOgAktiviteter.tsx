import { BodyLong, Heading } from "@navikt/ds-react";

import aktivitetStyles from "~/styles/aktiviteter.module.css";
import { aktivitetsTyper } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { Kalender } from "../../../tabeller/kalender/Kalender";
import { beregnTotalt } from "./kalenderOgAktiviteter.helpers";
import styles from "./kalenderOgAktiviteter.module.css";

interface IProps {
  periode: IRapporteringsperiode;
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
