import { getISOWeek } from "date-fns";
import { parse, serialize } from "tinyduration";
import type { IRapporteringsperiode } from "./types";

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function ukenummer(periode: IRapporteringsperiode) {
  return formaterPeriodeTilUkenummer(periode.periode.fraOgMed, periode.periode.tilOgMed);
}

export function formatterDag(dato: string) {
  const locale = "nb-NO";
  const options: Intl.DateTimeFormatOptions = { day: "2-digit" };
  return new Date(dato).toLocaleDateString(locale, options);
}

export function formatterDato({ dato, kort }: { dato: string; kort?: boolean }) {
  const locale = "nb-NO";

  const options: Intl.DateTimeFormatOptions = kort
    ? { year: "2-digit", month: "2-digit", day: "2-digit" }
    : { month: "long", day: "numeric" };

  const formattertDato = new Date(dato).toLocaleDateString(locale, options);

  return formattertDato;
}

export function getWeekDays(): { kort: string; lang: string }[] {
  const weekDays = new Array(7).fill(null).map((_, index) => {
    const date = new Date(Date.UTC(2017, 0, 2 + index)); // 2017-01-02 is just a random Monday
    return {
      kort: date.toLocaleDateString("nb-NO", { weekday: "short" }).replace(".", ""),
      lang: date.toLocaleDateString("nb-NO", { weekday: "long" }),
    };
  });

  return weekDays;
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

export function konverterFraISO8601Varighet(periode?: string): number | undefined {
  if (!periode) return undefined;

  periode = periode.replace(/\s/g, "");

  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}
