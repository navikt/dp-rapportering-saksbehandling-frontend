import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockMeldekortregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/person/:personId/rapporteringsperioder`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);
        const personId = params.personId as string;

        const allePerioder = db.hentAlleRapporteringsperioder();
        const rapporteringsperioder = allePerioder.filter((periode) => periode.ident === personId);

        logger.info(
          `Hentet ${rapporteringsperioder.length} rapporteringsperioder for person ${personId}`
        );

        return HttpResponse.json(rapporteringsperioder);
      }
    ),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode/:rapporteringsperiodeId`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);

        const rapporteringsperiodeId: string = params.rapporteringsperiodeId as string;
        const rapporteringsperiode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!rapporteringsperiode) {
          logger.error(`Fant ikke rapporteringsperiode ${rapporteringsperiodeId}`);
          return HttpResponse.json(null, { status: 404 });
        }

        logger.info(`Hentet rapporteringsperiode ${rapporteringsperiodeId}`);

        return HttpResponse.json(rapporteringsperiode);
      }
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode`,
      async ({ request, cookies }) => {
        const db = database || getDatabase(cookies);

        const rapporteringsperiode = (await request.json()) as IRapporteringsperiode;

        const korrigertPeriode = await db.korrigerPeriode(rapporteringsperiode);

        logger.info("Lagrer rapporteringsperiode");

        return HttpResponse.json(korrigertPeriode, { status: 200 });
      }
    ),
  ];
}
