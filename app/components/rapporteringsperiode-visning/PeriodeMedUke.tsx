import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./Forhandsvisning.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

export function PeriodeMedUke({ periode }: IProps) {
  console.log(periode);
  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });
  const uker = ukenummer(periode);

  return (
    <>
      <h3 className={styles.header}>Uke {uker}</h3>
      <div className={styles.periode}>
        {formattertFraOgMed} - {formattertTilOgMed}
      </div>
    </>
  );
}
