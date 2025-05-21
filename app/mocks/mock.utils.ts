import { addDays, format, startOfWeek, subDays, subYears } from "date-fns";

import { KJONN, KORT_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type {
  IPeriode,
  IPerson,
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
  ISaksbehandler,
  TKjonn,
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

export function getKjonnFromFnr(fnr: string): TKjonn {
  return (Number(fnr.substring(fnr.length, fnr.length - 1)) || 1) % 2 === 0
    ? KJONN.KVINNE
    : KJONN.MANN;
}

export function createFnr(birthdate?: Date): { ident: string; kjonn: TKjonn } {
  if (!birthdate) {
    birthdate = getRandomBirthDate();
  }
  const date = format(birthdate, "ddMMyy");
  const pnr = getRandomPnr();
  const ident = `${date}${pnr}`;

  return {
    ident,
    kjonn: getKjonnFromFnr(ident),
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
  person?: IPerson
): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: createId(),
    ident: person?.ident || createFnr().ident,
    type: KORT_TYPE.Elektronisk,
    periode: {
      fraOgMed,
      tilOgMed,
    },
    dager: lagDager(),
    sisteFristForTrekk: "",
    kanSendesFra: "",
    kanSendes: true,
    kanEndres: true,
    bruttoBelop: null,
    begrunnelseEndring: "",
    status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
    mottattDato: null,
    registrertArbeidssoker: null,
    originalId: null,
    html: null,
    rapporteringstype: null,
    kilde: props.kilde ?? null,
    ...props,
  };

  meldekort.kanSendesFra = format(subDays(new Date(meldekort.periode.tilOgMed), 1), "yyyy-MM-dd");
  meldekort.sisteFristForTrekk = format(
    addDays(new Date(meldekort.periode.tilOgMed), 8),
    "yyyy-MM-dd"
  );

  if (!props.dager) {
    meldekort.dager = meldekort.dager.map((dag, index) => ({
      ...dag,
      dato: format(addDays(new Date(meldekort.periode.fraOgMed), index), "yyyy-MM-dd"),
    }));
  }

  return meldekort;
}

export function lagPerson(props: Partial<IPerson> = {}, birthdate?: Date): IPerson {
  if (!birthdate) {
    birthdate = getRandomBirthDate();
  }

  const { ident, kjonn } = createFnr(birthdate);

  return {
    alder: subYears(new Date(), birthdate.getFullYear()).getFullYear(),
    fodselsdato: format(birthdate, "dd.MM.yyyy"),
    kjonn,
    statsborgerskap: "Norsk",
    fornavn: "",
    mellomnavn: "",
    etternavn: "",
    ident,
    sikkerhetstiltak: [],
    ...props,
  };
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
