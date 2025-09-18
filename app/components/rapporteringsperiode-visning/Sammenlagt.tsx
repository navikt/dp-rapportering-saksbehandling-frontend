import { BodyShort, Heading } from "@navikt/ds-react";

import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./Sammenlagt.module.css";
import { beregnTotalt } from "./sammenlagt.utils";

interface IProps {
  periode: IRapporteringsperiode;
}

const aktivitettyper = [
  { type: "Arbeid", label: "Jobb", erDager: false, klasse: "arbeid" },
  { type: "Syk", label: "Syk", erDager: true, klasse: "syk" },
  {
    type: "Fravaer",
    label: "Ferie, fravær og utenlandsopphold",
    erDager: true,
    klasse: "fravaer",
  },
  {
    type: "Utdanning",
    label: "Tiltak, kurs eller utdanning",
    erDager: true,
    klasse: "utdanning",
  },
];

export function Sammenlagt({ periode }: IProps) {
  const periodeId = `sammenlagt-${periode.id}`;

  return (
    <section aria-labelledby={periodeId} className={styles.sammenlagt}>
      <Heading level="4" size="xsmall" className={styles.tittel} id={periodeId}>
        Sammenlagt for perioden
      </Heading>
      <ul className={styles.aktivitetListe} aria-labelledby={periodeId}>
        {aktivitettyper.map(({ type, label, erDager, klasse }) => {
          const total = beregnTotalt(periode, type);
          const enhet = erDager ? "dager" : "timer";

          return (
            <li
              key={type}
              className={`${styles.aktivitet} ${klasse}`}
              aria-label={`${label}: ${total} ${enhet}`}
            >
              <BodyShort size="small" as="span" aria-hidden="true">
                {label}
              </BodyShort>
              <BodyShort size="small" as="span" aria-hidden="true">
                {total} {enhet}
              </BodyShort>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
