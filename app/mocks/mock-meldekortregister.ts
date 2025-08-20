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
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:meldekortId`,
      async ({ request, cookies }) => {
        const db = database || getDatabase(cookies);

        const rapporteringsperiode = (await request.json()) as IRapporteringsperiode;

        const korrigertPeriode = await db.korrigerPeriode(rapporteringsperiode);

        logger.info("Lagrer rapporteringsperiode");

        return HttpResponse.json(korrigertPeriode, { status: 200 });
      },
    ),

    http.put(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode/:rapporteringsperiodeId`,
      async ({ params, request, cookies }) => {
        const db = database || getDatabase(cookies);
        const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
        const oppdateringer = (await request.json()) as Partial<IRapporteringsperiode>;

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!eksisterendePeriode) {
          logger.error(`Fant ikke rapporteringsperiode ${rapporteringsperiodeId} for oppdatering`);
          return HttpResponse.json(null, { status: 404 });
        }

        const oppdatertPeriode = { ...eksisterendePeriode, ...oppdateringer };
        await db.oppdaterPeriode(rapporteringsperiodeId, oppdatertPeriode);

        logger.info(`Oppdaterte rapporteringsperiode ${rapporteringsperiodeId}`);

        return HttpResponse.json(oppdatertPeriode, { status: 200 });
      },
    ),
  ];
}
