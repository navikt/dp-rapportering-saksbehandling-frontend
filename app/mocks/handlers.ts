import { http, HttpResponse } from "msw";
import { getEnv } from "~/utils/env.utils";
import rapporteringsperioder from "./responses/rapporteringsperioder";
import { logger } from "~/models/logger.server";

export const handlers = [
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
];
