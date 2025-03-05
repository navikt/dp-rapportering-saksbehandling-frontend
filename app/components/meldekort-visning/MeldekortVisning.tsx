import type { IRapporteringsperiode } from "~/utils/types";
import { Forhandsvisning } from "./Forhandsvisning";
import styles from "./MeldekortVisning.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function MeldekortVisning({ perioder }: IProps) {
  return (
    <div className={styles.container}>
      <h2>Forhåndsvisning</h2>
      <div className={styles.perioder}>
        {perioder.map((periode) => (
          <Forhandsvisning key={periode.id} periode={periode} />
        ))}
      </div>
    </div>
  );
}
