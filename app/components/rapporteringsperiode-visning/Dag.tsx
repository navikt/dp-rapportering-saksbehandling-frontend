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

const getAktivitetsBeskrivelse = (dag: IRapporteringsperiodeDag): string => {
  const aktiviteter = dag.aktiviteter.map((a) => a.type);
  if (aktiviteter.length === 0) return "Ingen aktiviteter registrert";

  const beskrivelser: { [key: string]: string } = {
    Arbeid: "Arbeid",
    Syk: "Sykdom",
    Fravaer: "Fravær",
    Utdanning: "Utdanning",
  };

  return aktiviteter.map((a) => beskrivelser[a] || a).join(" og ");
};

export function Dag({ dag }: DagProps) {
  const arbeidTimer = konverterFraISO8601Varighet(
    dag.aktiviteter?.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? "",
  );

  const aktivitetsBeskrivelse = getAktivitetsBeskrivelse(dag);

  const harArbeidstimer = arbeidTimer && aktivitetsBeskrivelse === "Arbeid";
  const screenReaderText = harArbeidstimer
    ? `${arbeidTimer} timer arbeid`
    : `${aktivitetsBeskrivelse}${arbeidTimer ? `, ${arbeidTimer} timer arbeid` : ""}`;

  return (
    <td className={styles.dag}>
      <div className={styles.aktivitetContainer}>
        <span
          className={classNames(styles.aktivitet, styles.dato, dagKnappStyle(dag))}
          aria-hidden="true"
        >
          {formatterDag(dag.dato)}
        </span>
        {arbeidTimer && (
          <span className={styles.timer} aria-hidden="true">
            {arbeidTimer}t
          </span>
        )}
        <span className="sr-only">
          {formatterDag(dag.dato)}, {screenReaderText}
        </span>
      </div>
    </td>
  );
}
