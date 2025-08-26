import type { IPerson, IRapporteringsperiode, ISaksbehandler } from "~/utils/types";

import { createId } from "./mock.utils";
import { type Database } from "./session";

function hentAlleMeldekort(db: Database) {
  return db.meldekort.findMany({
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

function hentMeldekortMedId(db: Database, id: string) {
  return db.meldekort.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  }) as IRapporteringsperiode;
}

function korrigerMeldekort(db: Database, meldekort: IRapporteringsperiode) {
  const id = createId();

  db.meldekort.create({
    ...meldekort,
    id,
    originalMeldekortId: meldekort.id,
    kanSendes: false,
    kanEndres: true,
    innsendtTidspunkt: new Date().toISOString(),
  });

  return hentMeldekortMedId(db, id);
}

function sendInnMeldekort(
  db: Database,
  meldekortId: string,
  oppdateringer: Partial<IRapporteringsperiode>,
) {
  const eksisterendeMeldekort = hentMeldekortMedId(db, meldekortId);

  if (!eksisterendeMeldekort) {
    throw new Error(`Meldekort ${meldekortId} ikke funnet`);
  }

  const oppdatertMeldekort = {
    ...eksisterendeMeldekort,
    ...oppdateringer,
    kanSendes: false,
    kanEndres: true,
    innsendtTidspunkt: new Date().toISOString(),
  };

  db.meldekort.update({
    where: {
      id: {
        equals: meldekortId,
      },
    },
    data: oppdatertMeldekort,
  });

  return hentMeldekortMedId(db, meldekortId);
}

function leggTilMeldekort(db: Database, meldekort: IRapporteringsperiode) {
  db.meldekort.create(meldekort);
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

function hentPersoner(db: Database) {
  return db.personer.findMany({
    orderBy: [
      {
        ident: "desc",
      },
    ],
  }) as IPerson[];
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

export function withDb(db: Database) {
  return {
    leggTilMeldekort: (meldekort: IRapporteringsperiode) => leggTilMeldekort(db, meldekort),
    hentAlleMeldekort: () => hentAlleMeldekort(db),
    hentMeldekortMedId: (id: string) => hentMeldekortMedId(db, id),
    hentPerson: (personId: string) => hentPerson(db, personId),
    hentPersoner: () => hentPersoner(db),
    hentSaksbehandler: (saksbehandlerId: string) => hentSaksbehandler(db, saksbehandlerId),
    korrigerMeldekort: (meldekort: IRapporteringsperiode) => korrigerMeldekort(db, meldekort),
    sendInnMeldekort: (meldekortId: string, oppdateringer: Partial<IRapporteringsperiode>) =>
      sendInnMeldekort(db, meldekortId, oppdateringer),
  };
}
