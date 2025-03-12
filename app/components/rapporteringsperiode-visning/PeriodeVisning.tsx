import type { IRapporteringsperiode } from "~/utils/types";

import { Forhandsvisning } from "./Forhandsvisning";
import styles from "./PeriodeVisning.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function RapporteringsperiodeVisning({ perioder }: IProps) {
  return (
    <div className={styles.container}>
      <div className={styles.perioder}>
        {perioder.map((periode) => (
          <Forhandsvisning key={periode.id} periode={periode} />
        ))}
      </div>
    </div>
  );
}
