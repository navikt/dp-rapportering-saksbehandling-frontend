import { http, HttpResponse } from "msw";

import { mockSaksbehandler } from "./data/mock-saksbehandler";
import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockAzure(database?: ReturnType<typeof withDb>) {
  return [
    http.get("https://graph.microsoft.com/v1.0/me/", ({ cookies }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const db = database || getDatabase(cookies);

      return HttpResponse.json(mockSaksbehandler);
    }),
  ];
}
