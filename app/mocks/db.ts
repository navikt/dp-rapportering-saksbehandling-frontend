import { uuidv7 } from "uuidv7";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type {
  IArbeidssokerperiode,
  IPerson,
  IRapporteringsperiode,
  ISaksbehandler,
} from "~/utils/types";

import { type Database } from "./session";

function hentAlleRapporteringsperioder(db: Database) {
  return db.rapporteringsperioder.findMany({
    orderBy: [
      {
        periode: {
          fraOgMed: "desc",
        },
      },
      {
        innsendtTidspunkt: "desc",
      },
      {
        originalMeldekortId: "asc",
      },
    ],
  }) as IRapporteringsperiode[];
}

function hentRapporteringsperiodeMedId(db: Database, id: string) {
  return db.rapporteringsperioder.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  }) as IRapporteringsperiode;
}

function korrigerPeriode(db: Database, rapporteringsperiode: IRapporteringsperiode) {
  const id = uuidv7();

  const nyPeriode = db.rapporteringsperioder.create({
    ...rapporteringsperiode,
    id,
    originalMeldekortId: rapporteringsperiode.id,
    innsendtTidspunkt: new Date().toISOString(),
    status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
    kanSendes: false,
    kanEndres: true,
    sisteFristForTrekk: null,
  });

  return nyPeriode;
}

function oppdaterPeriode(db: Database, periodeId: string, oppdateringer: IRapporteringsperiode) {
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

  db.rapporteringsperioder.update({
    where: {
      id: {
        equals: periodeId,
      },
    },
    data: oppdatertPeriode,
  });
}

function periodeKanIkkeLengerSendes(db: Database, periodeId: string) {
  const eksisterendePeriode = hentRapporteringsperiodeMedId(db, periodeId);

  if (!eksisterendePeriode) {
    throw new Error(`Periode ${periodeId} ikke funnet`);
  }

  const oppdatertPeriode = {
    ...eksisterendePeriode,
    kanSendes: false,
    kanEndres: false,
  };

  db.rapporteringsperioder.update({
    where: {
      id: {
        equals: periodeId,
      },
    },
    data: oppdatertPeriode,
  });

  return hentRapporteringsperiodeMedId(db, periodeId);
}

function hentPerson(db: Database, personId: string) {
  return db.personer.findFirst({
    where: {
      id: {
        equals: personId,
      },
    },
  }) as IPerson;
}

function hentSaksbehandler(db: Database, saksbehandlerId: string) {
  return db.saksbehandlere.findFirst({
    where: {
      onPremisesSamAccountName: {
        equals: saksbehandlerId,
      },
    },
  }) as ISaksbehandler;
}

function hentArbeidssokerperioder(db: Database) {
  return db.arbeidssokerperioder.findMany({
    orderBy: [
      {
        startDato: "desc",
      },
    ],
  }) as IArbeidssokerperiode[];
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
  };
}
