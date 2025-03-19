import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockMeldekortregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(`${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperioder`, ({ cookies }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperioder = db.hentAlleRapporteringsperioder();

      logger.info(`Henter ${rapporteringsperioder.length} rapporteringsperioder`);

      return HttpResponse.json(rapporteringsperioder);
    }),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode/:rapporteringsperiodeId`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);

        const rapporteringsperiodeId: string = params.rapporteringsperiodeId as string;
        const rapporteringsperiode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!rapporteringsperiode) {
          logger.error(`Fant ikke rapporteringsperiode ${rapporteringsperiodeId}`);
          return HttpResponse.json(null, { status: 404 });
        } else {
          logger.info(`Henter rapporteringsperiode ${rapporteringsperiodeId}`);
        }

        return HttpResponse.json(rapporteringsperiode);
      }
    ),

    http.post(`${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode`, ({ cookies }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const db = database || getDatabase(cookies);

      logger.info("Lagrer rapporteringsperiode");
    }),
  ];
}
