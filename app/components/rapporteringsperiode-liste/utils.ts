import { AKTIVITET_TYPE } from "~/utils/constants";
import type { IRapporteringsperiode, TAktivitetType } from "~/utils/types";

export const aktivitetMapping: { [key in TAktivitetType]: { label: string; color: string } } = {
  [AKTIVITET_TYPE.Arbeid]: { label: "J", color: "arbeid" },
  [AKTIVITET_TYPE.Syk]: { label: "S", color: "syk" },
  [AKTIVITET_TYPE.Fravaer]: { label: "F", color: "fravaer" },
  [AKTIVITET_TYPE.Utdanning]: { label: "U", color: "utdanning" },
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
  perioder: IRapporteringsperiode[]
): Record<number, IRapporteringsperiode[]> {
  return perioder.reduce((groups, periode) => {
    // Bruk fraOgMed for å finne år
    const fraOgMedDate = new Date(periode.periode.fraOgMed);
    const year = fraOgMedDate.getFullYear();

    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(periode);
    return groups;
  }, {} as Record<number, IRapporteringsperiode[]>);
}
