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

        const alleMeldekort = db.hentAlleMeldekort();

        const meldekort = alleMeldekort.filter((mk) => mk.personId == personId);

        logger.info(`Hentet ${meldekort.length} meldekort for person ${personId}`);

        return HttpResponse.json(meldekort);
      },
    ),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:meldekortId`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);

        const meldekortId: string = params.meldekortId as string;
        const meldekort = db.hentMeldekortMedId(meldekortId);

        if (!meldekort) {
          logger.error(`Fant ikke meldekort ${meldekortId}`);
          return HttpResponse.json(null, { status: 404 });
        }

        logger.info(`Hentet meldekort ${meldekortId}`);

        return HttpResponse.json(meldekort);
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/meldekort`,
      async ({ request, cookies }) => {
        const db = database || getDatabase(cookies);
        const oppdatering = (await request.json()) as Partial<IRapporteringsperiode>;
        const meldekortId = oppdatering.id as string;

        const eksisterendeMeldekort = db.hentMeldekortMedId(meldekortId);

        if (!eksisterendeMeldekort) {
          logger.error(`Fant ikke meldekort med ID ${meldekortId} for innsending`);
          return HttpResponse.json(null, { status: 404 });
        }

        const oppdatertMeldekort = db.sendInnMeldekort(meldekortId, {
          ...eksisterendeMeldekort,
          ...oppdatering,
        });

        logger.info(`Sendte inn meldekort med ID ${meldekortId}`);

        return HttpResponse.json(oppdatertMeldekort, { status: 200 });
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/meldekort/korriger`,
      async ({ request, cookies }) => {
        const db = database || getDatabase(cookies);
        const oppdatering = (await request.json()) as Partial<IRapporteringsperiode>;
        const meldekortId = oppdatering.id as string;

        const eksisterendeMeldekort = db.hentMeldekortMedId(meldekortId);

        if (!eksisterendeMeldekort) {
          logger.error(`Fant ikke meldekort med ID ${meldekortId} for korrigering`);
          return HttpResponse.json(null, { status: 404 });
        }

        const oppdatertMeldekort = db.korrigerMeldekort({
          ...eksisterendeMeldekort,
          ...oppdatering,
        });

        logger.info(
          `Korrigerte meldekort med ID ${meldekortId}, ny ID er ${oppdatertMeldekort.id}`,
        );

        return HttpResponse.json(oppdatertMeldekort, { status: 200 });
      },
    ),
  ];
}
