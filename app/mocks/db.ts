import type { IRapporteringsperiode } from "~/utils/types";

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

function leggTilRapporteringsperiode(db: Database, rapporteringsperiode: IRapporteringsperiode) {
  db.rapporteringsperioder.create(rapporteringsperiode);
}

export function withDb(db: Database) {
  return {
    leggTilRapporteringsperiode: (rapporteringsperiode: IRapporteringsperiode) =>
      leggTilRapporteringsperiode(db, rapporteringsperiode),
    hentAlleRapporteringsperioder: () => hentAlleRapporteringsperioder(db),
    hentRapporteringsperiodeMedId: (id: string) => hentRapporteringsperiodeMedId(db, id),
  };
}
