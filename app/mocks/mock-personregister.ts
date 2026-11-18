import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getDemoStatus } from "~/utils/demo-params.utils";
import { getEnv } from "~/utils/env.utils";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockPersonregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(
      `${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/:personId`,
      async ({ cookies, params, request }) => {
        const db = database || (await getDatabase(cookies));

        const personId = params.personId as string;

        // Sjekk demo status parameter for feilsimulering
        const demoStatus = getDemoStatus(request.url);
        if (demoStatus === "404-person") {
          logger.warn(`[mock personregister]: Simulerer 404-feil for person ${personId}`);
          return HttpResponse.json(
            {
              title: "Person ikke funnet",
              status: 404,
              detail: `Fant ikke arbeidssøkerperioder for person med ID ${personId}`,
              correlationId: "demo-404-person-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        const person = db.hentArbeidssokerperioder();

        if (!person) {
          logger.error(`[mock personregister]: Fant ikke person ${personId}`);

          return HttpResponse.json(
            {
              title: "Person ikke funnet",
              status: 404,
              detail: `Fant ikke arbeidssøkerperioder for person med ID ${personId}`,
              correlationId: "person-not-found-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        logger.info(`[mock personregister]: Hentet person ${personId}`);

        return HttpResponse.json(person);
      },
    ),
  ];
}
