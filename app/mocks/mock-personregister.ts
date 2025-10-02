import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockPersonregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(
      `${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/:personId`,
      ({ cookies, params }) => {
        const db = database || getDatabase(cookies);

        const personId = params.personId as string;
        const person = db.hentArbeidssokerperioder();

        if (!person) {
          logger.error(`[mock meldekortregister]: Fant ikke person ${personId}`);

          return HttpResponse.json(null, { status: 404 });
        }

        logger.info(`[mock meldekortregister]: Hentet person ${personId}`);

        return HttpResponse.json(person);
      },
    ),
  ];
}
