import type { IRapporteringsperiode } from "~/utils/types";
import { EAktivitetType } from "~/utils/types";
import styles from "./TypeAktivitet.module.css";

const aktivitetMapping: { [key in EAktivitetType]: { label: string; color: string } } = {
  [EAktivitetType.Arbeid]: { label: "J", color: styles.arbeid },
  [EAktivitetType.Syk]: { label: "S", color: styles.syk },
  [EAktivitetType.Fravaer]: { label: "F", color: styles.fravaer },
  [EAktivitetType.Utdanning]: { label: "U", color: styles.utdanning },
};

const sortOrder = [
  EAktivitetType.Arbeid,
  EAktivitetType.Syk,
  EAktivitetType.Fravaer,
  EAktivitetType.Utdanning,
];

export const TypeAktivitet = ({ periode }: { periode: IRapporteringsperiode }) => {
  const aktiviteter: Set<EAktivitetType> = new Set();

  periode.dager.forEach((dag) => {
    dag.aktiviteter.forEach((aktivitet) => {
      aktiviteter.add(aktivitet.type);
    });
  });

  const sorterteAktiviteter = Array.from(aktiviteter).sort(
    (a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)
  );

  return (
    <ul className={styles.aktiviteter}>
      {sorterteAktiviteter.map((type) => (
        <li key={type} className={`${styles.aktivitet} ${aktivitetMapping[type].color}`}>
          {aktivitetMapping[type].label}
        </li>
      ))}
    </ul>
  );
};
