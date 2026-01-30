import { useGlobalSanityData } from "~/hooks/useGlobalSanityData";
import { getActivityClasses, getActivityDotColor } from "~/utils/aktivitet.utils";
import { AKTIVITET_LABELS_KORT, AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag, TAktivitetType } from "~/utils/types";

import styles from "./dag.module.css";

interface DagProps {
  dag: IRapporteringsperiodeDag;
}

const getAktivitetBeskrivelse = (
  type: TAktivitetType,
  timer?: string,
  kortLabels?: { jobb: string; syk: string; ferie: string; utdanning: string },
): string => {
  let beskrivelse: string;

  // Bruk Sanity-data hvis tilgjengelig, ellers fallback til constants
  if (kortLabels) {
    switch (type) {
      case AKTIVITET_TYPE.Arbeid:
        beskrivelse = kortLabels.jobb;
        break;
      case AKTIVITET_TYPE.Syk:
        beskrivelse = kortLabels.syk;
        break;
      case AKTIVITET_TYPE.Fravaer:
        beskrivelse = kortLabels.ferie;
        break;
      case AKTIVITET_TYPE.Utdanning:
        beskrivelse = kortLabels.utdanning;
        break;
      default:
        beskrivelse = type;
    }
  } else {
    beskrivelse = AKTIVITET_LABELS_KORT[type] || type;
  }

  if (type === AKTIVITET_TYPE.Arbeid && timer) {
    const arbeidTimer = konverterFraISO8601Varighet(timer);
    return arbeidTimer ? `${beskrivelse} ${arbeidTimer}t` : beskrivelse;
  }

  return beskrivelse;
};

export function Dag({ dag }: DagProps) {
  const sanityData = useGlobalSanityData();
  const harFlereAktiviteter = dag.aktiviteter && dag.aktiviteter.length > 1;
  const harAktiviteter = dag.aktiviteter && dag.aktiviteter.length > 0;
  const { datoColor, bgColor } = getActivityClasses(dag.aktiviteter);

  // Hent kort labels fra Sanity
  const kortLabels = sanityData?.aktiviteter
    ? {
        jobb: sanityData.aktiviteter.jobb.kort,
        syk: sanityData.aktiviteter.syk.kort,
        ferie: sanityData.aktiviteter.ferie.kort,
        utdanning: sanityData.aktiviteter.utdanning.kort,
      }
    : undefined;

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
                    kortLabels,
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
