import { Fragment } from "react";

import type { IRapporteringsperiode } from "~/utils/types";

import { Forhandsvisning } from "./Forhandsvisning";
import { PeriodeMedUke } from "./PeriodeMedUke";
import styles from "./PeriodeVisning.module.css";
import { Sammenlagt } from "./Sammenlagt";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function RapporteringsperiodeVisning({ perioder }: IProps) {
  return (
    <div className={styles.container}>
      <div className={styles.perioder}>
        {perioder.map((periode) => (
          <Fragment key={periode.id}>
            <PeriodeMedUke periode={periode} />
            <Forhandsvisning key={periode.id} periode={periode} />
            <Sammenlagt periode={periode} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
