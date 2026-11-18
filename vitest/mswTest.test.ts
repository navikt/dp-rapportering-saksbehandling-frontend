import { expect, test } from "vitest";

import { mockPersons } from "~/mocks/data/mock-persons";
import { getEnv } from "~/utils/env.utils";

test("fetches user data", async () => {
  const response = await fetch(
    `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${mockPersons[0].id}/meldekort`,
  );
  expect(response.status).toBe(200);
});
