import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";

import { mockPerson } from "./data/mock-person";

export const mockPersonregister = [
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/person/:id`, () => {
    logger.info(`Henter person ${mockPerson.ident}`);

    return HttpResponse.json(mockPerson);
  }),
];
