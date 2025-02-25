import styles from "./TypeAktivitet.module.css";
import type { TAktivitetType, IRapporteringsperiode } from "~/utils/types";
import { AKTIVITET_TYPE } from "~/utils/constants";

export const aktivitetMapping: { [key in TAktivitetType]: { label: string; color: string } } = {
  [AKTIVITET_TYPE.Arbeid]: { label: "J", color: styles.arbeid },
  [AKTIVITET_TYPE.Syk]: { label: "S", color: styles.syk },
  [AKTIVITET_TYPE.Fravaer]: { label: "F", color: styles.fravaer },
  [AKTIVITET_TYPE.Utdanning]: { label: "U", color: styles.utdanning },
};

export function unikeAktiviteter(periode: IRapporteringsperiode): TAktivitetType[] {
  const aktiviteter = periode.dager
    .map((dag) => dag.aktiviteter.map((aktivitet) => aktivitet.type))
    .flat();

  return Array.from(new Set(aktiviteter));
}

export const sortOrder = [
  AKTIVITET_TYPE.Arbeid,
  AKTIVITET_TYPE.Syk,
  AKTIVITET_TYPE.Fravaer,
  AKTIVITET_TYPE.Utdanning,
];

export function sorterAktiviteter(aktiviteter: TAktivitetType[]): TAktivitetType[] {
  return aktiviteter.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
}
