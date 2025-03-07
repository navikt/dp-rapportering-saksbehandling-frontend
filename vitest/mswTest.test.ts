import { expect, test } from "vitest";

import { getEnv } from "~/utils/env.utils";

test("fetches user data", async () => {
  const response = await fetch(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`);
  expect(response.status).toBe(200);
});
