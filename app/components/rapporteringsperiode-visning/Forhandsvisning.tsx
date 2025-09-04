import { getWeekDays } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Dag } from "./Dag";
import styles from "./Forhandsvisning.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Forhandsvisning({ periode }: IProps) {
  if (!periode) return null;

  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);
  const ukedager = getWeekDays();

  return (
    <table
      className={styles.rapporteringsperiodeTabell}
      role="table"
      aria-label={`Rapporteringsperiode for periode ${periode.id}`}
    >
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
          <th scope="row" className="sr-only">
            Første uke
          </th>
          {forsteUke.map((dag) => (
            <Dag key={dag.dato} dag={dag} />
          ))}
        </tr>
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
