import { getWeekDays, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

import { Dag } from "./components/Dag";
import styles from "./kalender.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

function UkeRad({ dager, ukenummer }: { dager: IRapporteringsperiodeDag[]; ukenummer: string }) {
  return (
    <tr>
      <th scope="row" className="sr-only">
        Uke {ukenummer}
      </th>
      {dager.map((dag) => (
        <Dag key={dag.dato} dag={dag} />
      ))}
    </tr>
  );
}

export function Kalender({ periode }: IProps) {
  if (!periode) return null;

  const forsteUke = periode.dager.slice(0, 7);
  const andreUke = periode.dager.slice(7, 14);
  const ukedager = getWeekDays();
  const [forsteUkenummer, andreUkenummer] = ukenummer(periode).split("-");

  return (
    <table className={styles.kalenderTabell}>
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
        <UkeRad dager={forsteUke} ukenummer={forsteUkenummer} />
        <tr>
          <td colSpan={7} className={styles.mellomrom} />
        </tr>
        <UkeRad dager={andreUke} ukenummer={andreUkenummer} />
      </tbody>
    </table>
  );
}
