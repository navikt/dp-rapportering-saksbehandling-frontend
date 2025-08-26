import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockMeldekortregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);
        const personId = params.personId as string;

        const allePerioder = db.hentAlleRapporteringsperioder();

        const rapporteringsperioder = allePerioder.filter(
          (periode) => periode.personId == personId,
        );

        logger.info(
          `Hentet ${rapporteringsperioder.length} rapporteringsperioder for person ${personId}`,
        );

        return HttpResponse.json(rapporteringsperioder);
      },
    ),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:meldekortId`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);

        const meldekortId: string = params.meldekortId as string;
        const rapporteringsperiode = db.hentRapporteringsperiodeMedId(meldekortId);

        if (!rapporteringsperiode) {
          logger.error(`Fant ikke rapporteringsperiode ${meldekortId}`);
          return HttpResponse.json(null, { status: 404 });
        }

        logger.info(`Hentet rapporteringsperiode ${meldekortId}`);

        return HttpResponse.json(rapporteringsperiode);
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/meldekort`,
      async ({ request, cookies }) => {
        const db = database || getDatabase(cookies);
        const oppdatering = (await request.json()) as Partial<IRapporteringsperiode>;
        const meldekortId = oppdatering.id as string;

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(meldekortId);

        if (!eksisterendePeriode) {
          logger.error(`Fant ikke meldekort med ID ${meldekortId} for innsending`);
          return HttpResponse.json(null, { status: 404 });
        }
        const oppdatertPeriode: IRapporteringsperiode = {
          ...eksisterendePeriode,
          ...oppdatering,
          kanSendes: false,
          kanEndres: true,
          innsendtTidspunkt: new Date().toISOString(),
        };

        db.oppdaterPeriode(meldekortId, oppdatertPeriode);

        logger.info(`Sendte inn meldekort med ID ${meldekortId}`);

        return HttpResponse.json(oppdatertPeriode, { status: 200 });
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/meldekort/korriger`,
      async ({ request, cookies }) => {
        const db = database || getDatabase(cookies);
        const oppdatering = (await request.json()) as Partial<IRapporteringsperiode>;
        const meldekortId = oppdatering.id as string;

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(meldekortId);

        if (!eksisterendePeriode) {
          logger.error(`Fant ikke meldekort med ID ${meldekortId} for korrigering`);
          return HttpResponse.json(null, { status: 404 });
        }

        const oppdatertPeriode: IRapporteringsperiode = {
          ...eksisterendePeriode,
          ...oppdatering,
          kanSendes: false,
          kanEndres: true,
        };

        db.korrigerPeriode(oppdatertPeriode);

        logger.info(`Korrigerte meldekort med ID ${meldekortId}, ny ID er ${oppdatertPeriode.id}`);

        return HttpResponse.json(oppdatertPeriode, { status: 200 });
      },
    ),
  ];
}
