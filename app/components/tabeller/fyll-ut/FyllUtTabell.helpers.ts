import { AKTIVITET_TYPE } from "~/utils/constants";
import type { TAktivitetType } from "~/utils/types";

import type { IKorrigertDag } from "../../../utils/korrigering.utils";

/**
 * Beregner totalt antall arbeidstimer for en gitt aktivitetstype på tvers av alle dager
 */
export function beregnTotaltAntallTimer(dager: IKorrigertDag[], type: TAktivitetType): number {
  return dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((a) => a.type === type);
    const timer = aktivitet?.timer ? parseFloat(aktivitet.timer) || 0 : 0;
    return sum + timer;
  }, 0);
}

/**
 * Beregner totalt antall dager med en gitt aktivitetstype
 */
export function beregnTotaltAntallDager(dager: IKorrigertDag[], type: TAktivitetType): number {
  return dager.filter((dag) => dag.aktiviteter.some((a) => a.type === type)).length;
}

/**
 * Formaterer et desimaltall til norsk format (komma som desimalskilletegn)
 */
export function formaterDesimalNorsk(tall: number): string {
  return tall.toString().replace(".", ",");
}

/**
 * Returnerer riktig enhet basert på aktivitetstype og antall
 * - For Arbeid: "timer"
 * - For andre: "dag" eller "dager" basert på antall
 */
export function pluraliserEnhet(antall: number, type: TAktivitetType): string {
  if (type === AKTIVITET_TYPE.Arbeid) {
    return "timer";
  }

  return antall === 1 ? "dag" : "dager";
}

/**
 * Genererer CSS-klassenavn fra aktivitetstype med gitt prefix
 * Eksempel: ("Arbeid", "trHover") => "trHoverArbeid"
 */
export function lagAktivitetKlassenavn(type: string, prefix: string): string {
  const kapitalisert = type.charAt(0).toUpperCase() + type.slice(1);
  return `${prefix}${kapitalisert}`;
}

/**
 * Beregner totalt beløp (timer eller dager) basert på aktivitetstype
 */
export function beregnTotalBeløp(dager: IKorrigertDag[], type: TAktivitetType): number {
  if (type === AKTIVITET_TYPE.Arbeid) {
    return beregnTotaltAntallTimer(dager, type);
  }
  return beregnTotaltAntallDager(dager, type);
}

/**
 * Formaterer totalbeløp for visning basert på aktivitetstype
 * - For Arbeid: formaterer med norsk desimaltall
 * - For andre: returnerer antall som string
 */
export function formaterTotalBeløp(dager: IKorrigertDag[], type: TAktivitetType): string {
  const total = beregnTotalBeløp(dager, type);

  if (type === AKTIVITET_TYPE.Arbeid) {
    return formaterDesimalNorsk(total);
  }

  return total.toString();
}

/**
 * Sjekker om alle aktiviteter har null/tomme verdier
 */
export function harNoenAktiviteter(dager: IKorrigertDag[]): boolean {
  return dager.some((dag) => dag.aktiviteter.length > 0);
}
