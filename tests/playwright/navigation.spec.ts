import { test, expect } from "@playwright/test";

test("basic navigation", async ({ page }) => {
  await page.goto("http://localhost:5173/rapportering/123");
  await page.waitForFunction(() => document.title === "New React Router App");
  expect(await page.title()).toBe("New React Router App");
});
