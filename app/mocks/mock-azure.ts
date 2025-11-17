import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getDemoStatus } from "~/utils/demo-params.utils";

import { mockSaksbehandler } from "./data/mock-saksbehandler";
import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockAzure(database?: ReturnType<typeof withDb>) {
  return [
    http.get("https://graph.microsoft.com/v1.0/me/", async ({ cookies, request }) => {
      // Sjekk demo status parameter for feilsimulering
      const demoStatus = getDemoStatus(request.url);
      if (demoStatus === "401-token") {
        logger.info("[mock azure]: Simulerer 401-feil (ugyldig token)");
        return HttpResponse.json(
          {
            error: {
              code: "InvalidAuthenticationToken",
              message: "Access token validation failure. Invalid audience.",
            },
          },
          { status: 401 },
        );
      }

      const db = database || (await getDatabase(cookies));

      const saksbehandlerId = mockSaksbehandler.onPremisesSamAccountName;
      const saksbehandler = db.hentSaksbehandler(saksbehandlerId);

      if (!saksbehandler) {
        logger.error(`Fant ikke saksbehandler ${saksbehandlerId}`);
        return HttpResponse.json(null, { status: 404 });
      }

      logger.info(`Hentet saksbehandler ${saksbehandlerId}`);

      return HttpResponse.json(saksbehandler);
    }),
  ];
}
