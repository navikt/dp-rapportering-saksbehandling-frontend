import { formatterDato, getWeekDays, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./Forhandsvisning.module.css";
import { Uke } from "./Uke";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Forhandsvisning({ periode }: IProps) {
  if (!periode) return null;

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);

  const ukedager = getWeekDays();

  return (
    <div className="meldekort">
      <div>
        <h3 className={styles.header}>Uke {ukenummer(periode)}</h3>
        <span className={styles.periode}>
          {formattertFraOgMed} - {formattertTilOgMed}
        </span>
      </div>
      <table className={styles.meldekortTabell}>
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
    </div>
  );
}
