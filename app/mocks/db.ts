import { uuidv7 } from "uuidv7";

import type { IBehandlingsresultat } from "~/utils/behandlingsresultat.types";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type {
  IArbeidssokerperiode,
  IPerson,
  IRapporteringsperiode,
  ISaksbehandler,
} from "~/utils/types";

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
  };
}
