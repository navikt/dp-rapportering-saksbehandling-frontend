import { http, HttpResponse } from "msw";

import { getEnv } from "~/utils/env.utils";

import { mockBehandlinger } from "./data/mock-behandlinger";

export function mockBehandling() {
  return [
    http.get(`${getEnv("DP_BEHANDLING_URL")}/behandlinger/:fnr`, async () => {
      return HttpResponse.json(mockBehandlinger);
    }),
  ];
}
