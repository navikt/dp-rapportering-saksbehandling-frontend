import { BodyShort } from "@navikt/ds-react";

import aktivitetStyles from "~/styles/aktiviteter.module.css";
import { AKTIVITET_TYPE, aktivitetsTyper, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import {
  DatoFormat,
  formatterDato,
  konverterFraISO8601Varighet,
  ukenummer,
} from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { KalenderTabell } from "../tabeller/kalender/KalenderTabell";
import styles from "./PeriodeVisning.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
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

export function RapporteringsperiodeVisning({ perioder }: IProps) {
  return perioder.map((periode) => {
    const { fraOgMed, tilOgMed } = periode.periode;
    const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
    const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });
    const uker = ukenummer(periode);

    // Sjekk om meldekort er tomt/klar til utfylling
    const erTilUtfylling =
      periode.status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling && periode.kanSendes;

    return (
      <section key={periode.id} aria-labelledby={`periode-${periode.id}`} className={styles.root}>
        {erTilUtfylling ? (
          <div className={styles.tomMeldekort}>
            <BodyShort>Dette meldekortet er ikke fylt ut enda.</BodyShort>
          </div>
        ) : (
          <>
            <div>
              <h3 id={`periode-${periode.id}`}>Uke {uker}</h3>
              <BodyShort size="small">
                <time dateTime={fraOgMed}>{formattertFraOgMed}</time> -{" "}
                <time dateTime={tilOgMed}>{formattertTilOgMed}</time>
              </BodyShort>
            </div>
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
          </>
        )}
      </section>
    );
  });
}
