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
    <table className={styles.rapporteringsperiodeTabell}>
      <thead>
        <tr>
          {ukedager.map((ukedag, index) => (
            <th key={`${periode.id}-${index}`}>
              <span>{ukedag.kort}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {forsteUke.map((dag) => (
            <Dag key={dag.dato} dag={dag} />
          ))}
        </tr>
        <tr>
          {andreUke.map((dag) => (
            <Dag key={dag.dato} dag={dag} />
          ))}
        </tr>
      </tbody>
    </table>
  );
}
