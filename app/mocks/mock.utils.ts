import { addDays, format, startOfWeek, subDays, subYears } from "date-fns";

import { AKTIVITET_TYPE, KORT_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { konverterTilISO8601Varighet } from "~/utils/dato.utils";
import type {
  IAktivitet,
  IPeriode,
  IPerson,
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
  ISaksbehandler,
} from "~/utils/types";

export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function getRandomPnr() {
  return Math.floor(Math.random() * (100_000 - 10_000) + 10_000).toString();
}

export function getRandomBirthDate() {
  const from = subYears(new Date(), 67);
  const to = subYears(new Date(), 18);
  return randomDate(from, to);
}

export function createFnr(birthdate?: Date): { ident: string } {
  if (!birthdate) {
    birthdate = getRandomBirthDate();
  }
  const date = format(birthdate, "ddMMyy");
  const pnr = getRandomPnr();
  const ident = `${date}${pnr}`;

  return {
    ident,
  };
}

export function createId(): string {
  return String(Math.floor(Math.random() * 10_000_000_000));
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

export function lagRapporteringsperiode(
  props: Partial<IRapporteringsperiode> = {},
  person?: IPerson,
): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: createId(),
    personId: person?.id || createId(),
    ident: person?.ident || createFnr().ident,
    status: RAPPORTERINGSPERIODE_STATUS.Klar,
    type: KORT_TYPE.Elektronisk,
    periode: {
      fraOgMed,
      tilOgMed,
    },
    dager: lagDager(),
    kanSendes: true,
    kanEndres: true,
    kanSendesFra: "",
    sisteFristForTrekk: "",
    korrigering: null,
    opprettetAv: "Arena",
    kilde: props.kilde ?? null,
    innsendtTidspunkt: null,
    registrertArbeidssoker: null,
    begrunnelse: "",
    ...props,
  };

  meldekort.kanSendesFra = format(subDays(new Date(meldekort.periode.tilOgMed), 1), "yyyy-MM-dd");
  meldekort.sisteFristForTrekk = format(
    addDays(new Date(meldekort.periode.tilOgMed), 8),
    "yyyy-MM-dd",
  );

  if (!props.dager) {
    meldekort.dager = meldekort.dager.map((dag, index) => ({
      ...dag,
      dato: format(addDays(new Date(meldekort.periode.fraOgMed), index), "yyyy-MM-dd"),
    }));
  }

  return meldekort;
}

export function lagSaksbehandler(props: Partial<ISaksbehandler> = {}) {
  return {
    onPremisesSamAccountName: "Z993298",
    givenName: "Frans Kake Jaeger",
    displayName: "franz",
    mail: "fran@kake.jaeger",
    ...props,
  };
}

// Hjelpefunksjon for å lage ett meldekort
export const lagArbeidUker = (
  timer: string,
): Array<null | Pick<IAktivitet, "type" | "timer">[]> => [
  // Uke 1
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Mandag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Tirsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Onsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Torsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Fredag
  null, // Lørdag
  null, // Søndag
  // Uke 2
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Mandag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Tirsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Onsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Torsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Fredag
  null, // Lørdag
  null, // Søndag
];

// Hjelpefunksjon for å lage ett meldekort med arbeid annen hver dag
export const lagAlternerendeArbeidsUker = (
  timer: string,
): Array<null | Pick<IAktivitet, "type" | "timer">[]> => [
  // Uke 1
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Mandag
  null, // Tirsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Onsdag
  null, // Torsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Fredag
  null, // Lørdag
  null, // Søndag
  // Uke 2
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Mandag
  null, // Tirsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Onsdag
  null, // Torsdag
  [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet(timer) }], // Fredag
  null, // Lørdag
  null, // Søndag
];
