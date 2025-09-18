import { BodyShort } from "@navikt/ds-react";

import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Forhandsvisning } from "./Forhandsvisning";
import styles from "./PeriodeVisning.module.css";
import { beregnTotalt } from "./sammenlagt.utils";

interface IProps {
  perioder: IRapporteringsperiode[];
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

export function RapporteringsperiodeVisning({ perioder }: IProps) {
  return (
    <div className={styles.perioder}>
      {perioder.map((periode) => {
        const { fraOgMed, tilOgMed } = periode.periode;
        const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
        const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });
        const uker = ukenummer(periode);

        return (
          <section key={periode.id} aria-labelledby={`periode-${periode.id}`}>
            <h3 id={`periode-${periode.id}`} className={styles.header}>
              Uke {uker}
            </h3>
            <p className={styles.periode}>
              <time dateTime={fraOgMed}>{formattertFraOgMed}</time> -{" "}
              <time dateTime={tilOgMed}>{formattertTilOgMed}</time>
            </p>
            <Forhandsvisning periode={periode} />
            <div className={styles.sammenlagt}>
              <h4 className={styles.sammenlagtTittel} id={`sammenlagt-${periode.id}`}>
                Sammenlagt for perioden
              </h4>
              <ul className={styles.aktivitetListe} aria-labelledby={`sammenlagt-${periode.id}`}>
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
            </div>
          </section>
        );
      })}
    </div>
  );
}
