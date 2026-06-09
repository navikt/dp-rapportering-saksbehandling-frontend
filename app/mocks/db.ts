import { addDays, addWeeks, differenceInDays, format, startOfWeek } from "date-fns";
import { uuidv7 } from "uuidv7";

import type { IBehandlingsresultat } from "~/utils/behandlingsresultat.types";
import { MELDEKORT_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type {
  IArbeidssokerperiode,
  IKilde,
  IPerson,
  IRapporteringsperiode,
  ISaksbehandler,
} from "~/utils/types";

import { lagDager, lagRapporteringsperiode } from "./mock.utils";
import { type Database } from "./session";

function hentAlleRapporteringsperioder(db: Database) {
  return db.rapporteringsperioder.findMany((q) => q.where({}), {
    orderBy: {
      periode: {
        fraOgMed: "desc",
      },
      innsendtTidspunkt: "desc",
      originalMeldekortId: "asc",
    },
  }) as IRapporteringsperiode[];
}

function hentRapporteringsperiodeMedId(db: Database, id: string) {
  return db.rapporteringsperioder.findFirst((q) => q.where({ id: id })) as IRapporteringsperiode;
}

function korrigerPeriode(db: Database, rapporteringsperiode: IRapporteringsperiode) {
  const id = uuidv7();

  return db.rapporteringsperioder.create({
    ...rapporteringsperiode,
    id,
    originalMeldekortId: rapporteringsperiode.id,
    innsendtTidspunkt: new Date().toISOString(),
    status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
    kanSendes: false,
    kanEndres: true,
    sisteFristForTrekk: null,
  });
}

async function oppdaterPeriode(
  db: Database,
  periodeId: string,
  oppdateringer: IRapporteringsperiode,
) {
  const eksisterendePeriode = hentRapporteringsperiodeMedId(db, periodeId);

  if (!eksisterendePeriode) {
    throw new Error(`Periode ${periodeId} ikke funnet`);
  }

  const oppdatertPeriode = {
    ...eksisterendePeriode,
    ...oppdateringer,
    innsendtTidspunkt: new Date().toISOString(),
    kanSendes: false,
    kanEndres: true,
  };

  await oppdaterRapporteringsperiode(db, oppdatertPeriode);
}

async function periodeKanIkkeLengerSendes(db: Database, periodeId: string) {
  const eksisterendePeriode = hentRapporteringsperiodeMedId(db, periodeId);

  if (!eksisterendePeriode) {
    throw new Error(`Periode ${periodeId} ikke funnet`);
  }

  const oppdatertPeriode = {
    ...eksisterendePeriode,
    kanSendes: false,
    kanEndres: false,
  };

  await oppdaterRapporteringsperiode(db, oppdatertPeriode);

  return hentRapporteringsperiodeMedId(db, periodeId);
}

async function oppdaterRapporteringsperiode(db: Database, oppdatertPeriode: IRapporteringsperiode) {
  await db.rapporteringsperioder.update((q) => q.where({ id: oppdatertPeriode.id }), {
    data(periode) {
      periode.id = oppdatertPeriode.id;
      periode.ident = oppdatertPeriode.ident;
      periode.status = oppdatertPeriode.status;
      periode.type = oppdatertPeriode.type;
      periode.periode = oppdatertPeriode.periode;
      periode.dager = oppdatertPeriode.dager;
      periode.kanSendes = oppdatertPeriode.kanSendes;
      periode.kanEndres = oppdatertPeriode.kanEndres;
      periode.kanSendesFra = oppdatertPeriode.kanSendesFra;
      periode.sisteFristForTrekk = oppdatertPeriode.sisteFristForTrekk;
      periode.opprettetAv = oppdatertPeriode.opprettetAv;
      periode.originalMeldekortId = oppdatertPeriode.originalMeldekortId;
      periode.kilde = oppdatertPeriode.kilde;
      periode.innsendtTidspunkt = oppdatertPeriode.innsendtTidspunkt;
      periode.meldedato = oppdatertPeriode.meldedato;
      periode.registrertArbeidssoker = oppdatertPeriode.registrertArbeidssoker;
      periode.begrunnelse = oppdatertPeriode.begrunnelse;
      periode.opprettetManuelt = oppdatertPeriode.opprettetManuelt;
    },
  });
}

function hentPerson(db: Database, personId: string) {
  return db.personer.findFirst((q) => q.where({ id: personId })) as IPerson;
}

function hentSaksbehandler(db: Database, saksbehandlerId: string) {
  return db.saksbehandlere.findFirst((q) =>
    q.where({ onPremisesSamAccountName: saksbehandlerId }),
  ) as ISaksbehandler;
}

function hentArbeidssokerperioder(db: Database) {
  return db.arbeidssokerperioder.findMany((q) => q.where({}), {
    orderBy: {
      startDato: "desc",
    },
  }) as IArbeidssokerperiode[];
}

function hentBehandlingsresultat(db: Database) {
  return db.behandlingsresultat.findMany() as IBehandlingsresultat[];
}

function beregnAntallMeldekort(fraDato: string, tilDato: string): number {
  const startDato = new Date(fraDato);
  startDato.setHours(0, 0, 0, 0);
  const sluttDato = new Date(tilDato);
  sluttDato.setHours(0, 0, 0, 0);

  // Valider datoer
  if (Number.isNaN(startDato.getTime()) || Number.isNaN(sluttDato.getTime())) {
    return 0;
  }

  // Finn første mandag på eller etter startDato
  const mandagIStartUke = startOfWeek(startDato, { weekStartsOn: 1 });
  const forsteMandagIStart =
    mandagIStartUke < startDato ? addWeeks(mandagIStartUke, 1) : mandagIStartUke;

  // Beregn antall dager fra start til slutt (inklusiv)
  const dagerTotalt = differenceInDays(sluttDato, forsteMandagIStart) + 1;

  // Hver periode er 14 dager, så antall komplette perioder er:
  return Math.max(0, Math.floor(dagerTotalt / 14));
}

function beregnAntallOpprettbareMeldekort(
  db: Database,
  fraDato: string,
  tilDato: string,
  ident: string,
): number {
  const startDato = new Date(fraDato);
  startDato.setHours(0, 0, 0, 0);
  const sluttDato = new Date(tilDato);
  sluttDato.setHours(0, 0, 0, 0);

  // Valider datoer
  if (Number.isNaN(startDato.getTime()) || Number.isNaN(sluttDato.getTime())) {
    return 0;
  }

  // Finn første mandag på eller etter startDato
  const mandagIStartUke = startOfWeek(startDato, { weekStartsOn: 1 });
  const forsteMandagIStart =
    mandagIStartUke < startDato ? addWeeks(mandagIStartUke, 1) : mandagIStartUke;

  // Beregn antall 2-ukers perioder
  const antallPerioder = beregnAntallMeldekort(fraDato, tilDato);

  // Hent alle eksisterende perioder for denne personen
  const eksisterendePerioder = hentAlleRapporteringsperioder(db).filter((p) => p.ident === ident);

  let opprettbarePerioder = 0;

  for (let i = 0; i < antallPerioder; i++) {
    // Beregn start og slutt for hver 2-ukers periode
    const periodeStart = addWeeks(forsteMandagIStart, i * 2);
    const periodeSlutt = addDays(periodeStart, 13);

    // Sjekk at perioden er innenfor det ønskede området
    if (periodeSlutt > sluttDato) {
      break;
    }

    // Sjekk om det allerede finnes et meldekort for denne perioden
    const periodeStartStr = format(periodeStart, "yyyy-MM-dd");
    const periodeSluttStr = format(periodeSlutt, "yyyy-MM-dd");
    const finnesDuplikat = eksisterendePerioder.some(
      (p) => p.periode.fraOgMed === periodeStartStr && p.periode.tilOgMed === periodeSluttStr,
    );

    if (!finnesDuplikat) {
      opprettbarePerioder++;
    }
  }

  return opprettbarePerioder;
}

function opprettManueltMeldekort(
  db: Database,
  fraDato: string,
  tilDato: string,
  ident: string,
  kilde: IKilde,
): IRapporteringsperiode[] {
  const startDato = new Date(fraDato);
  startDato.setHours(0, 0, 0, 0); // Normaliser til midnatt for sammenligning
  const sluttDato = new Date(tilDato);
  sluttDato.setHours(0, 0, 0, 0); // Normaliser til midnatt for sammenligning

  // Valider datoer
  if (Number.isNaN(startDato.getTime()) || Number.isNaN(sluttDato.getTime())) {
    return [];
  }

  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0); // Normaliser til midnatt for sammenligning

  // Finn første mandag på eller etter startDato
  const mandagIStartUke = startOfWeek(startDato, { weekStartsOn: 1 });
  const forsteMandagIStart =
    mandagIStartUke < startDato ? addWeeks(mandagIStartUke, 1) : mandagIStartUke;

  // Beregn antall 2-ukers perioder
  const antallPerioder = beregnAntallMeldekort(fraDato, tilDato);

  const opprettedeMeldekort: IRapporteringsperiode[] = [];

  // Hent alle eksisterende perioder for denne personen én gang (utenfor løkken)
  const eksisterendePerioder = hentAlleRapporteringsperioder(db).filter((p) => p.ident === ident);

  for (let i = 0; i < antallPerioder; i++) {
    // Beregn start og slutt for hver 2-ukers periode
    const periodeStart = addWeeks(forsteMandagIStart, i * 2);
    const periodeSlutt = addDays(periodeStart, 13);

    // Sjekk at perioden er innenfor det ønskede området
    if (periodeSlutt > sluttDato) {
      break;
    }

    // Sjekk om det allerede finnes et meldekort for denne perioden
    const periodeStartStr = format(periodeStart, "yyyy-MM-dd");
    const periodeSluttStr = format(periodeSlutt, "yyyy-MM-dd");
    const finnesDuplikat = eksisterendePerioder.some(
      (p) => p.periode.fraOgMed === periodeStartStr && p.periode.tilOgMed === periodeSluttStr,
    );

    if (finnesDuplikat) {
      continue; // Hopp over denne perioden hvis den allerede eksisterer
    }

    // Bestem type basert på om perioden er i fortiden
    const meldekortType =
      periodeSlutt < iDag ? MELDEKORT_TYPE.ETTERREGISTRERT : MELDEKORT_TYPE.ORDINAERT;

    // Lag dager for perioden med riktige datoer
    const dager = lagDager().map((dag, index) => ({
      ...dag,
      dato: format(addDays(periodeStart, index), "yyyy-MM-dd"),
    }));

    // Beregn kanSendesFra og sisteFristForTrekk
    // For alle meldekort: kan sendes fra dagen før periodeSlutt
    const kanSendesFra = format(addDays(periodeSlutt, -1), "yyyy-MM-dd");

    // For etterregistrerte: sett frist til 8 dager fra nå (siden perioden allerede er over)
    // For ordinære: sett frist til 8 dager etter periodeSlutt
    const sisteFristForTrekk =
      meldekortType === MELDEKORT_TYPE.ETTERREGISTRERT
        ? format(addDays(iDag, 8), "yyyy-MM-dd")
        : format(addDays(periodeSlutt, 8), "yyyy-MM-dd");

    // Lag nytt meldekort med lagRapporteringsperiode helper
    const nyttMeldekort = lagRapporteringsperiode({
      type: meldekortType,
      ident,
      periode: {
        fraOgMed: format(periodeStart, "yyyy-MM-dd"),
        tilOgMed: format(periodeSlutt, "yyyy-MM-dd"),
      },
      dager,
      kilde,
      kanSendesFra,
      sisteFristForTrekk,
      opprettetManuelt: true,
    });

    // Lagre til database
    db.rapporteringsperioder.create(nyttMeldekort);
    opprettedeMeldekort.push(nyttMeldekort);
  }

  return opprettedeMeldekort;
}

export function withDb(db: Database) {
  return {
    hentAlleRapporteringsperioder: () => hentAlleRapporteringsperioder(db),
    hentPerson: (personId: string) => hentPerson(db, personId),
    hentRapporteringsperiodeMedId: (id: string) => hentRapporteringsperiodeMedId(db, id),
    hentSaksbehandler: (saksbehandlerId: string) => hentSaksbehandler(db, saksbehandlerId),
    korrigerPeriode: (rapporteringsperiode: IRapporteringsperiode) =>
      korrigerPeriode(db, rapporteringsperiode),
    oppdaterPeriode: (periodeId: string, oppdateringer: IRapporteringsperiode) =>
      oppdaterPeriode(db, periodeId, oppdateringer),
    periodeKanIkkeLengerSendes: (periodeId: string) => periodeKanIkkeLengerSendes(db, periodeId),
    hentArbeidssokerperioder: () => hentArbeidssokerperioder(db),
    hentBehandlingsresultat: () => hentBehandlingsresultat(db),
    beregnAntallMeldekort: (fraDato: string, tilDato: string) =>
      beregnAntallMeldekort(fraDato, tilDato),
    beregnAntallOpprettbareMeldekort: (fraDato: string, tilDato: string, ident: string) =>
      beregnAntallOpprettbareMeldekort(db, fraDato, tilDato, ident),
    opprettManueltMeldekort: (fraDato: string, tilDato: string, ident: string, kilde: IKilde) =>
      opprettManueltMeldekort(db, fraDato, tilDato, ident, kilde),
  };
}
