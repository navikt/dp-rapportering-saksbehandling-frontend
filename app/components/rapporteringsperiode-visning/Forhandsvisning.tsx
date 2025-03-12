import { formatterDato, getWeekDays, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./Forhandsvisning.module.css";
import { PeriodeMedUke } from "./PeriodeMedUke";
import { Sammenlagt } from "./Sammenlagt";
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
    <div>
      <PeriodeMedUke
        ukenummer={ukenummer(periode)}
        formattertFraOgMed={formattertFraOgMed}
        formattertTilOgMed={formattertTilOgMed}
      />
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
          <Uke uke={forsteUke} />
          <Uke uke={andreUke} />
        </tbody>
      </table>
      <Sammenlagt periode={periode} />
    </div>
  );
}
