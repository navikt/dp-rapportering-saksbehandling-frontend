import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import { mockPerson } from "./data/mock-person";
import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockPersonregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(`${getEnv("DP_PERSONREGISTER_URL")}/person/:id`, ({ cookies }) => {
      const db = database || getDatabase(cookies);

      const personId = mockPerson.ident;
      const person = db.hentPerson(personId);

      if (!person) {
        logger.error(`Fant ikke person ${personId}`);
        return HttpResponse.json(null, { status: 404 });
      }

      logger.info(`Hentet person ${personId}`);

      return HttpResponse.json(person);
    }),
  ];
}
