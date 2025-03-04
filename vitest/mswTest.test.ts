import { expect, test } from "vitest";
import { getEnv } from "~/utils/env.utils";

test("fetches user data", async () => {
  console.log("BASE_PATH", getEnv("BASE_PATH"));
  console.log("DP_RAPPORTERING_URL", getEnv("DP_RAPPORTERING_URL"));
  console.log("IS_LOCALHOST", getEnv("IS_LOCALHOST"));
  console.log("USE_MSW", getEnv("USE_MSW"));

  const response = await fetch(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`);
  expect(response.status).toBe(200);
});
