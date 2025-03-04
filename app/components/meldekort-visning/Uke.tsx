import { formatterDag } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";
import { aktivitetMapping } from "~/components/meldekort-liste/utils";
import styles from "./uke.module.css";
import classNames from "classnames";

type AktivitetType = keyof typeof aktivitetMapping;

interface IProps {
  uke: IRapporteringsperiodeDag[];
}

const erAktivStil = (dag: IRapporteringsperiodeDag, typer: AktivitetType[]) =>
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

export function Uke({ uke }: IProps) {
  if (!uke?.length) return null;

  return (
    <tr>
      {uke.map((dag) => (
        <td key={dag.dato}>
          <div className={styles.aktivitetContainer}>
            <span className={classNames(styles.aktivitet, styles.dato, dagKnappStyle(dag))}>
              {formatterDag(dag.dato)}
            </span>
          </div>
        </td>
      ))}
    </tr>
  );
}
