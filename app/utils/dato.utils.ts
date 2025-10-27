import { getISOWeek } from "date-fns";
import { parse, serialize } from "tinyduration";

import type { IPeriode, IRapporteringsperiode } from "./types";

export enum DatoFormat {
  DagMnd = "dag-mnd",
  DagMndAar = "dd.mm.yyyy",
  DagMndAarLang = "lang",
  Kort = "kort",
}

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function ukenummer(periode: IRapporteringsperiode) {
  return formaterPeriodeTilUkenummer(periode.periode.fraOgMed, periode.periode.tilOgMed);
}

export function hentUkerFraPeriode(periode: IPeriode): number[] {
  const startUkenummer = getISOWeek(new Date(periode.fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(periode.tilOgMed));

  return [startUkenummer, sluttUkenummer];
}

export function formatterDag(dato: string) {
  const locale = "nb-NO";
  const options: Intl.DateTimeFormatOptions = { day: "2-digit" };
  return new Date(dato).toLocaleDateString(locale, options);
}

export function formatterDato({
  dato,
  format = DatoFormat.DagMnd,
}: {
  dato: string;
  format?: DatoFormat;
}): string {
  const date = new Date(dato);
  const locale = "nb-NO";

  switch (format) {
    case DatoFormat.DagMndAar:
      return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    case DatoFormat.DagMndAarLang:
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    case DatoFormat.Kort:
      return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });

    case DatoFormat.DagMnd:
    default:
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
      });
  }
}

/**
 * Formaterer dato i UTC tidssone (ikke konvertert til lokal tid)
 * Bruk denne for tidspunkt som kommer fra backend (f.eks. innsendtTidspunkt)
 */
export function formatterDatoUTC({
  dato,
  format = DatoFormat.DagMnd,
}: {
  dato: string;
  format?: DatoFormat;
}): string {
  const date = new Date(dato);
  const locale = "nb-NO";

  switch (format) {
    case DatoFormat.DagMndAar:
      return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });

    case DatoFormat.DagMndAarLang:
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });

    case DatoFormat.Kort:
      return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "UTC",
      });

    case DatoFormat.DagMnd:
    default:
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });
  }
}

/**
 * Formaterer klokkeslett i UTC tidssone (ikke konvertert til lokal tid)
 * Bruk denne for tidspunkt som kommer fra backend (f.eks. innsendtTidspunkt)
 */
export function formatterKlokkeslettUTC(dato: string): string {
  const date = new Date(dato);
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function getWeekDays(): { kort: string; lang: string }[] {
  const weekDays = new Array(7).fill(null).map((_, index) => {
    const date = new Date(Date.UTC(2017, 0, 2 + index)); // 2017-01-02 is just a random Monday
    const kort = date.toLocaleDateString("nb-NO", { weekday: "short" }).replace(".", "");
    return {
      kort: kort.charAt(0).toUpperCase() + kort.slice(1).toLowerCase(),
      lang: date.toLocaleDateString("nb-NO", { weekday: "long" }),
    };
  });

  return weekDays;
}

export function hentUkedag(dato: string): string {
  const date = new Date(dato);
  const weekDays = getWeekDays();
  return weekDays[(date.getUTCDay() + 6) % 7].kort;
}

export function konverterTilISO8601Varighet(varighet: string): string {
  const delt = varighet.trim().replace(/\./g, ",").split(",");
  const timer = delt[0] || 0;
  const minutter = delt[1] || 0;
  const minutterProsent = parseFloat(`0.${minutter}`);

  return serialize({
    hours: timer as number,
    minutes: Math.round(minutterProsent * 60),
  });
}

export function konverterFraISO8601Varighet(periode?: string | null): number | undefined {
  if (!periode || periode.trim() === "") return undefined;

  try {
    periode = periode.replace(/\s/g, "");
    const parsed = parse(periode);
    const timer = parsed.hours || 0;
    const minutt = parsed.minutes || 0;
    return timer + minutt / 60;
  } catch (error) {
    console.warn("Invalid duration format:", periode, error);
    return undefined;
  }
}
