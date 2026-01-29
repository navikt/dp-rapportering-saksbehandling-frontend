import { BodyLong, Detail, Heading } from "@navikt/ds-react";

import aktivitetStyles from "~/styles/aktiviteter.module.css";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { aktivitetsTyper } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { Kalender } from "../../../tabeller/kalender/Kalender";
import { beregnTotalt } from "./kalenderOgAktiviteter.helpers";
import styles from "./kalenderOgAktiviteter.module.css";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_TEKSTER = {
  aktiviteterTittel: "Sammenlagt for perioden",
  noActivitiesText: "Ingen aktiviteter er registrert for dette meldekortet",
};

interface IProps {
  periode: IRapporteringsperiode;
  variant?: ABTestVariant;
  aktiviteterTittel?: string;
  noActivitiesText?: string;
}

export function KalenderOgAktiviteter({
  periode,
  variant,
  aktiviteterTittel = DEFAULT_TEKSTER.aktiviteterTittel,
  noActivitiesText = DEFAULT_TEKSTER.noActivitiesText,
}: IProps) {
  // Sjekk om alle aktiviteter er 0
  const harAktiviteter = aktivitetsTyper.some(({ type }) => beregnTotalt(periode, type) > 0);

  return (
    <div className={styles.kalenderOgSammenlagt}>
      <Kalender periode={periode} variant={variant} hideWeekLabels={true} />
      {harAktiviteter ? (
        <div className={styles.sammenlagt} id={`sammenlagt-${periode.id}`}>
          <Heading level="4" size="xsmall">
            {aktiviteterTittel}
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
      ) : (
        <Detail className={styles.ingenAktiviteter}>{noActivitiesText}</Detail>
      )}
    </div>
  );
}
