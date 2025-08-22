import { expect, test } from "vitest";

import { getEnv } from "~/utils/env.utils";

test("fetches user data", async () => {
  const response = await fetch(
    `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/132456789/meldekort`,
  );
  expect(response.status).toBe(200);
});
