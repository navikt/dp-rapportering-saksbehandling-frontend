import { http, HttpResponse } from "msw";
import { getEnv } from "~/utils/env.utils";
import rapporteringsperioder from "./responses/rapporteringsperioder";

export const handlers = [
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    return HttpResponse.json(rapporteringsperioder);
  }),

  http.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperiodeId`,
    ({ params }) => {
      const rapporteringsperiodeId = params.rapporteringsperiodeId;
      const rapporteringsperiode = rapporteringsperioder.find(
        (r) => r.id === rapporteringsperiodeId
      );

      return HttpResponse.json(rapporteringsperiode);
    }
  ),
];
