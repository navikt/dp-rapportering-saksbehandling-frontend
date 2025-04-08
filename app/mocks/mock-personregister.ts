import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockPersonregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(`${getEnv("DP_PERSONREGISTER_URL")}/person/:id`, ({ cookies, params }) => {
      const db = database || getDatabase(cookies);

      const personId = params.id as string;
      const person = db.hentPerson(personId);

      if (!person) {
        logger.error(`Fant ikke person ${personId}`);

        return HttpResponse.json(null, { status: 404 });
      }

      logger.info(`Hentet person ${personId}`);

      return HttpResponse.json(person);
    }),

    http.get(`${getEnv("DP_PERSONREGISTER_URL")}/personer`, ({ cookies }) => {
      const db = database || getDatabase(cookies);

      const personer = db.hentPersoner();

      if (!personer?.length) {
        logger.error(`Fant ikke personer`);
        return HttpResponse.json(null, { status: 404 });
      }

      logger.info(`Hentet ${personer.length} personer`);

      return HttpResponse.json(personer);
    }),
  ];
}
