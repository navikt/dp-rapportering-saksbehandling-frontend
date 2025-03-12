import { Tag } from "@navikt/ds-react";

import { getWeekDays, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Uke } from "../rapporteringsperiode-visning/Uke";
import styles from "./korrigering.module.css";

export function EndretPeriode({ periode }: { periode: IRapporteringsperiode }) {
  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);

  const ukedager = getWeekDays();

  return (
    <>
      <div className={styles.periodeTag}>
        <h3>Uke {ukenummer(periode)}</h3>
        <Tag variant="error">Korrigering</Tag>
      </div>
      <table>
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
          <Uke uke={forsteUke} />
          <Uke uke={andreUke} />
        </tbody>
      </table>
    </>
  );
}
