import { http, HttpResponse } from "msw";

import { getEnv } from "~/utils/env.utils";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockBehandling(database?: ReturnType<typeof withDb>) {
  return [
    http.get(`${getEnv("DP_BEHANDLING_URL")}/behandlinger/:fnr`, async ({ cookies }) => {
      const db = database || (await getDatabase(cookies));

      const behandlinger = db.hentBehandlingsresultat();

      return HttpResponse.json(behandlinger);
    }),
  ];
}
