import { expect, test } from "@playwright/test";
import { uuidv7 } from "uuidv7";

import { server, startMockServer } from "~/mocks/server";

const url = "http://localhost:5173";

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  context.addCookies([{ name: "sessionId", value: uuidv7(), url }]);

  startMockServer(server);
});

test.afterAll(async ({ browser }) => {
  await browser.close();
});

test("basic navigation", async ({ page }) => {
  await page.goto(url);
  await page.waitForFunction(() => document.title === "Dagpenger saksbehandling");

  expect(await page.title()).toBe("Dagpenger saksbehandling");
});
