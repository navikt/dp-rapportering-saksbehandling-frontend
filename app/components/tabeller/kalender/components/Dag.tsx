import { getActivityClasses, getActivityDotColor } from "~/utils/aktivitet.utils";
import { AKTIVITET_LABELS_KORT, AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag, TAktivitetType } from "~/utils/types";

import styles from "./dag.module.css";

interface DagProps {
  dag: IRapporteringsperiodeDag;
}

const getAktivitetBeskrivelse = (type: TAktivitetType, timer?: string): string => {
  const beskrivelse = AKTIVITET_LABELS_KORT[type] || type;

  if (type === AKTIVITET_TYPE.Arbeid && timer) {
    const arbeidTimer = konverterFraISO8601Varighet(timer);
    return arbeidTimer ? `${beskrivelse} ${arbeidTimer}t` : beskrivelse;
  }

  return beskrivelse;
};

export function Dag({ dag }: DagProps) {
  const harFlereAktiviteter = dag.aktiviteter && dag.aktiviteter.length > 1;
  const harAktiviteter = dag.aktiviteter && dag.aktiviteter.length > 0;
  const { datoColor, bgColor } = getActivityClasses(dag.aktiviteter);

  // Sorter aktiviteter i visningsrekkefølge: Arbeid, Syk, Fravaer, Utdanning
  const sorterteAktiviteter = harAktiviteter
    ? [...dag.aktiviteter].sort((a, b) => {
        const order = [
          AKTIVITET_TYPE.Arbeid,
          AKTIVITET_TYPE.Syk,
          AKTIVITET_TYPE.Fravaer,
          AKTIVITET_TYPE.Utdanning,
        ];
        return order.indexOf(a.type as TAktivitetType) - order.indexOf(b.type as TAktivitetType);
      })
    : [];

  return (
    <td className={styles.tableCell}>
      <div className={styles.dagWrapper}>
        <div className={`${styles.dag} ${harAktiviteter ? bgColor : ""}`}>
          <span
            aria-hidden="true"
            className={`${styles.dato} ${harAktiviteter ? datoColor : styles.ingenAktivitet}`}
          >
            {formatterDag(dag.dato)}
          </span>
          {harAktiviteter && (
            <div
              className={`${styles.aktiviteterWrapper} ${harFlereAktiviteter ? styles.venstrestilt : ""}`}
            >
              {sorterteAktiviteter.map((aktivitet, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className={`${styles.aktivitet} ${harFlereAktiviteter ? styles.flereAktiviteter : ""} ${harFlereAktiviteter ? getActivityDotColor(aktivitet.type) : ""}`}
                >
                  {getAktivitetBeskrivelse(
                    aktivitet.type as TAktivitetType,
                    aktivitet.timer ?? undefined,
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </td>
  );
}
