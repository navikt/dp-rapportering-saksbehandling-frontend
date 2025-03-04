import { expect, test } from "vitest";
import { getEnv } from "~/utils/env.utils";

test("fetches user data", async () => {
  console.log("env", process.env);

  const response = await fetch(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`);
  expect(response.status).toBe(200);
});
