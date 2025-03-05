import { http, HttpResponse } from "msw";
import { getEnv } from "~/utils/env.utils";
import rapporteringsperioder from "./responses/rapporteringsperioder";

export const handlers = [
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    console.log("Henter", rapporteringsperioder.length, "rapporteringsperioder");

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
        console.log("Fant ikke rapporteringsperiode", rapporteringsperiodeId);
      } else {
        console.log("Henter rapporteringsperiode", rapporteringsperiode?.id);
      }

      return HttpResponse.json(rapporteringsperiode);
    }
  ),
];
