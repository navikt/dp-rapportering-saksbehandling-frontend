import classNames from "classnames";

import { formatterDag, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./dag.module.css";

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

const getAktivitetsBakgrunn = (dag: IRapporteringsperiodeDag): string => {
  const aktiviteter = dag.aktiviteter.filter((a) => a.type !== "Arbeid").map((a) => a.type);

  if (aktiviteter.includes("Syk")) return "sykdom";
  if (aktiviteter.includes("Fravaer")) return "fravaer";
  if (aktiviteter.includes("Utdanning")) return "utdanning";

  return "";
};

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

  // Finn ikke-arbeid aktiviteter
  const ikkeArbeidAktiviteter = dag.aktiviteter.filter((a) => a.type !== "Arbeid");
  const aktivitetsForkortelser = [
    ...new Set(
      ikkeArbeidAktiviteter.map((a) => {
        switch (a.type) {
          case "Syk":
            return "S";
          case "Fravaer":
            return "F";
          case "Utdanning":
            return "U";
          default:
            return a.type.charAt(0);
        }
      }),
    ),
  ].join("");

  const harArbeidstimer = arbeidTimer && aktivitetsBeskrivelse === "Arbeid";
  const screenReaderText = harArbeidstimer
    ? `${arbeidTimer} timer arbeid`
    : `${aktivitetsBeskrivelse}${arbeidTimer ? `, ${arbeidTimer} timer arbeid` : ""}`;

  const harIndicator = arbeidTimer || aktivitetsForkortelser;

  return (
    <td className={styles.rootContainer}>
      <div className={classNames(styles.dagContainer, { [styles.utenTimer]: !harIndicator })}>
        <span
          className={classNames(styles.dag, styles.dato, dagKnappStyle(dag))}
          aria-hidden="true"
        >
          {formatterDag(dag.dato)}
        </span>
        {arbeidTimer && (
          <span className={styles.timer} aria-hidden="true">
            J ({arbeidTimer}t)
          </span>
        )}
        {!arbeidTimer && aktivitetsForkortelser && (
          <span
            className={classNames(
              styles.timer,
              styles.aktivitetsIndikator,
              styles[getAktivitetsBakgrunn(dag)],
            )}
            aria-hidden="true"
          >
            {aktivitetsForkortelser}
          </span>
        )}
        <span className="sr-only">
          {formatterDag(dag.dato)}, {screenReaderText}
        </span>
      </div>
    </td>
  );
}
