import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";

import { mockSaksbehandler } from "./data/mock-saksbehandler";
import type { withDb } from "./db";
import { getDatabase } from "./db.utils";
import { withSession } from "./session.utils";

export function mockAzure(database?: ReturnType<typeof withDb>) {
  return [
    http.get(
      "https://graph.microsoft.com/v1.0/me/",
      withSession(({ cookies }) => {
        const db = database || getDatabase(cookies);

        const saksbehandlerId = mockSaksbehandler.onPremisesSamAccountName;
        const saksbehandler = db.hentSaksbehandler(saksbehandlerId);

        if (!saksbehandler) {
          logger.error(`Fant ikke saksbehandler ${saksbehandlerId}`);
          return HttpResponse.json(null, { status: 404 });
        }

        logger.info(`Hentet saksbehandler old old ${saksbehandlerId}`);

        return HttpResponse.json(saksbehandler);
      })
    ),
  ];
}
