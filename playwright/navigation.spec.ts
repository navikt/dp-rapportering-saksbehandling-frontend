import { test, expect } from "@playwright/experimental-ct-react";

test("basic navigation", async ({ page }) => {
  await page.goto("http://localhost:5173/rapportering");
  await page.waitForFunction(() => document.title === "Dagpenger saksbehandling");
  expect(await page.title()).toBe("Dagpenger saksbehandling");
});
