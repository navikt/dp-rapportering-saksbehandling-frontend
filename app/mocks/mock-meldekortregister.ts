import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import rapporteringsperioder from "./data/mock-rapporteringsperioder";

export const mockMeldekortregister = [
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    logger.info(`Henter ${rapporteringsperioder.length} rapporteringsperioder`);

    return HttpResponse.json(rapporteringsperioder);
  }),

  http.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperiodeId`,
    ({ params }) => {
      const rapporteringsperiodeId = params.rapporteringsperiodeId;
      const rapporteringsperiode = rapporteringsperioder.find(
        (r) => r.id === rapporteringsperiodeId
      );

      if (!rapporteringsperiode?.id) {
        logger.error(`Fant ikke rapporteringsperiode ${rapporteringsperiodeId}`);
      } else {
        logger.info(`Henter rapporteringsperiode ${rapporteringsperiodeId}`);
      }

      return HttpResponse.json(rapporteringsperiode);
    }
  ),

  http.post(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode`, () => {
    logger.info("Lagrer rapporteringsperiode");
  }),
];
