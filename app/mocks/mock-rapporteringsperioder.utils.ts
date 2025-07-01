import { addDays, format, startOfWeek } from "date-fns";

import type { IPeriode, IRapporteringsperiodeDag } from "~/utils/types";

let idCounter = 1;

export function createId(): string {
  return String(idCounter++);
}

export function formatereDato(dato: Date): string {
  return format(dato, "yyyy-MM-dd");
}

export function lagPeriodeDatoFor(dato: Date): IPeriode {
  const startDato = startOfWeek(new Date(dato), { weekStartsOn: 1 });

  return {
    fraOgMed: formatereDato(startDato),
    tilOgMed: formatereDato(addDays(startDato, 13)),
  };
}

export function beregnNåværendePeriodeDato(): IPeriode {
  return lagPeriodeDatoFor(new Date());
}

export function lagDager(): IRapporteringsperiodeDag[] {
  return new Array(14).fill(null).map((_, i) => ({
    dagIndex: i,
    dato: "",
    aktiviteter: [],
  }));
}
