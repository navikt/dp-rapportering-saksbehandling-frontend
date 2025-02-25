import { http, HttpResponse } from "msw";
import { getEnv } from "~/utils/env.utils";
import rapporteringsperioder from "./responses/rapporteringsperioder";

export const handlers = [
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    return HttpResponse.json(rapporteringsperioder);
  }),
];
