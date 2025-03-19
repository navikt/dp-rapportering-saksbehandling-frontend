import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import { mockPerson } from "./data/mock-person";
import { getDatabase } from "./db.utils";
import type { Database } from "./session";

export function mockPersonregister(database?: Database) {
  return [
    http.get(`${getEnv("DP_PERSONREGISTER_URL")}/person/:id`, ({ cookies }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const db = database || getDatabase(cookies);

      logger.info(`Henter person ${mockPerson.ident}`);

      return HttpResponse.json(mockPerson);
    }),
  ];
}
