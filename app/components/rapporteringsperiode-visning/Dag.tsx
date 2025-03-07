import classNames from "classnames";

import { formatterDag, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./Uke.module.css";

interface DagProps {
  dag: IRapporteringsperiodeDag;
}

const erAktivStil = (dag: IRapporteringsperiodeDag, typer: string[]) =>
  typer.every((type) => dag.aktiviteter.some((a) => a.type === type));

const dagKnappStyle = (dag: IRapporteringsperiodeDag) => ({
  [styles.arbeid]: erAktivStil(dag, ["Arbeid"]),
  [styles.sykdom]: erAktivStil(dag, ["Syk"]),
  [styles.fravaer]: erAktivStil(dag, ["Fravaer"]),
  [styles.utdanning]: erAktivStil(dag, ["Utdanning"]),
  [styles.arbeidOgUtdanning]: erAktivStil(dag, ["Arbeid", "Utdanning"]),
  [styles.sykOgUtdanning]: erAktivStil(dag, ["Syk", "Utdanning"]),
  [styles.fravaerOgUtdanning]: erAktivStil(dag, ["Fravaer", "Utdanning"]),
  [styles.sykOgFravaer]: erAktivStil(dag, ["Syk", "Fravaer"]),
  [styles.sykFravaerOgUtdanning]: erAktivStil(dag, ["Syk", "Fravaer", "Utdanning"]),
});

export function Dag({ dag }: DagProps) {
  return (
    <td key={dag.dato}>
      <div className={styles.aktivitetContainer}>
        <span className={classNames(styles.aktivitet, styles.dato, dagKnappStyle(dag))}>
          {formatterDag(dag.dato)}
        </span>
        {konverterFraISO8601Varighet(
          dag.aktiviteter?.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? ""
        ) && (
          <span className={styles.timer}>
            {konverterFraISO8601Varighet(
              dag.aktiviteter?.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? ""
            )}
          </span>
        )}
      </div>
    </td>
  );
}
