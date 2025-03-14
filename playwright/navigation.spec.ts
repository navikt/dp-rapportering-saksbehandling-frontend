import { expect, test } from "@playwright/experimental-ct-react";

import { setup, startMockServer } from "~/mocks/server";

test.beforeAll(() => {
  const server = setup();
  startMockServer(server);
});

test("basic navigation", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForFunction(() => document.title === "Dagpenger saksbehandling");
  expect(await page.title()).toBe("Dagpenger saksbehandling");
});
