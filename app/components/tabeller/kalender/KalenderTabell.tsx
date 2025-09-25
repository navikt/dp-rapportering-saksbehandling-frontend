import { getWeekDays, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Dag } from "./components/Dag";
import styles from "./kalenderTabell.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

export function KalenderTabell({ periode }: IProps) {
  if (!periode) return null;

  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);
  const ukedager = getWeekDays();

  // Sjekk om første uke har timer
  const forsteUkeHarTimer = forsteUke.some((dag) => {
    const arbeidTimer = konverterFraISO8601Varighet(
      dag.aktiviteter?.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? "",
    );
    return !!arbeidTimer;
  });

  return (
    <table className={styles.kalenderTabell} role="table">
      <caption className="sr-only">Oversikt over rapporterte dager for perioden</caption>
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Ukedag
          </th>
          {ukedager.map((ukedag, index) => (
            <th key={`${periode.id}-${index}`} scope="col">
              <span aria-hidden="true">{ukedag.kort}</span>
              <span className="sr-only">{ukedag.lang}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {/* TODO: gjør sr uke dynamisk */}
          <th scope="row" className="sr-only">
            Første uke
          </th>
          {forsteUke.map((dag) => (
            <Dag key={dag.dato} dag={dag} />
          ))}
        </tr>
        {!forsteUkeHarTimer && (
          <tr>
            <td colSpan={8} className={styles.mellomrom} />
          </tr>
        )}
        <tr>
          <th scope="row" className="sr-only">
            Andre uke
          </th>
          {andreUke.map((dag) => (
            <Dag key={dag.dato} dag={dag} />
          ))}
        </tr>
      </tbody>
    </table>
  );
}
