import { getISOWeek } from "date-fns";
import type { IRapporteringsperiode } from "./types";

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function ukenummer(periode: IRapporteringsperiode) {
  return formaterPeriodeTilUkenummer(periode.periode.fraOgMed, periode.periode.tilOgMed);
}

export function formatterDato({ dato, kort }: { dato: string; kort?: boolean }) {
  const locale = "nb-NO";

  const options: Intl.DateTimeFormatOptions = {
    month: kort ? "2-digit" : "long",
    day: kort ? "2-digit" : "numeric",
  };

  const formattertDato = new Date(dato).toLocaleDateString(locale, options);

  return formattertDato;
}
