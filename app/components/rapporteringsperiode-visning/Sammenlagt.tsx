import type { IRapporteringsperiode } from "~/utils/types";
import { konverterFraISO8601Varighet } from "~/utils/dato.utils";
import styles from "./Sammenlagt.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

function beregnTotalt(periode: IRapporteringsperiode, type: string, erDager: boolean) {
  return periode.dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((aktivitet) => aktivitet.type === type);
    if (!aktivitet) return sum;
    return erDager ? sum + 1 : sum + (konverterFraISO8601Varighet(aktivitet.timer) || 0);
  }, 0);
}

const aktivitettyper = [
  { type: "Arbeid", label: "Jobb", erDager: false, klasse: "arbeid" },
  { type: "Syk", label: "Syk", erDager: true, klasse: "syk" },
  {
    type: "Fravaer",
    label: "Ferie, fravær og utenlandsopphold",
    erDager: true,
    klasse: "fravaer",
  },
  {
    type: "Utdanning",
    label: "Tiltak, kurs eller utdanning",
    erDager: true,
    klasse: "utdanning",
  },
];

export function Sammenlagt({ periode }: IProps) {
  return (
    <div>
      <h4 className={styles.tittel}>Sammenlagt for perioden</h4>
      {aktivitettyper.map(({ type, label, erDager, klasse }) => {
        const total = beregnTotalt(periode, type, erDager);
        return (
          <div key={type} className={`${styles.aktivitet} ${klasse}`}>
            <p>{label}</p>
            <p>
              {total} {erDager ? "dager" : "timer"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
