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
  return (
    <>
      <Heading level="4" size="xsmall" className={styles.tittel}>
        Sammenlagt for perioden
      </Heading>
      {aktivitettyper.map(({ type, label, erDager, klasse }) => {
        const total = beregnTotalt(periode, type, erDager);
        return (
          <div key={type} className={`${styles.aktivitet} ${klasse}`}>
            <BodyShort size="small">{label}</BodyShort>
            <BodyShort size="small">
              {total} {erDager ? "dager" : "timer"}
            </BodyShort>
          </div>
        );
      })}
    </>
  );
}
