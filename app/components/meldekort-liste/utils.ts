import { AKTIVITET_TYPE } from "~/utils/constants";
import { groupByYear } from "~/utils/dato.utils";
import type { IRapporteringsperiode, TAktivitetType } from "~/utils/types";

export const aktivitetMapping: {
  [key in TAktivitetType]: { label: string; color: string; aria: string };
} = {
  [AKTIVITET_TYPE.Arbeid]: { label: "J", color: "arbeid", aria: "Jobb" },
  [AKTIVITET_TYPE.Syk]: { label: "S", color: "syk", aria: "Syk" },
  [AKTIVITET_TYPE.Fravaer]: {
    label: "F",
    color: "fravaer",
    aria: "Ferie, fravær eller utenlandsopphold",
  },
  [AKTIVITET_TYPE.Utdanning]: {
    label: "U",
    color: "utdanning",
    aria: "Tiltak, kurs eller utdanning",
  },
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

/**
 * Utility function to group periods by year based on fraOgMed date
 * Use the start date to determine which year the period belongs to
 */
export function groupPeriodsByYear(
  perioder: IRapporteringsperiode[],
): Record<number, IRapporteringsperiode[]> {
  return groupByYear(perioder, (periode) => new Date(periode.periode.fraOgMed));
}
