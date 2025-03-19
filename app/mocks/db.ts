import { uuidv7 } from "uuidv7";

import type { IPerson, IRapporteringsperiode, ISaksbehandler } from "~/utils/types";

import { type Database } from "./session";

function hentAlleRapporteringsperioder(db: Database) {
  return db.rapporteringsperioder.findMany({
    orderBy: [
      {
        mottattDato: "desc",
      },
      {
        originalId: "asc",
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

  db.rapporteringsperioder.create({
    ...rapporteringsperiode,
    id,
    originalId: rapporteringsperiode.id,
  });

  return hentRapporteringsperiodeMedId(db, id);
}

function leggTilRapporteringsperiode(db: Database, rapporteringsperiode: IRapporteringsperiode) {
  db.rapporteringsperioder.create(rapporteringsperiode);
}

function hentPerson(db: Database, personId: string) {
  return db.personer.findFirst({
    where: {
      ident: {
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

export function withDb(db: Database) {
  return {
    leggTilRapporteringsperiode: (rapporteringsperiode: IRapporteringsperiode) =>
      leggTilRapporteringsperiode(db, rapporteringsperiode),
    hentAlleRapporteringsperioder: () => hentAlleRapporteringsperioder(db),
    hentRapporteringsperiodeMedId: (id: string) => hentRapporteringsperiodeMedId(db, id),
    hentPerson: (personId: string) => hentPerson(db, personId),
    hentSaksbehandler: (saksbehandlerId: string) => hentSaksbehandler(db, saksbehandlerId),
    korrigerPeriode: (rapporteringsperiode: IRapporteringsperiode) =>
      korrigerPeriode(db, rapporteringsperiode),
  };
}
