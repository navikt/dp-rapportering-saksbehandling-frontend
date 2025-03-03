import { test, expect } from "@playwright/experimental-ct-react";
import { FormattertDato } from "~/components/meldekort-liste/FormattertDato";

test.describe("FormattertDato", () => {
  test("skal formatere dato i lang format", async ({ mount }) => {
    const dato = "2025-03-03";
    const component = await mount(<FormattertDato dato={dato} />);
    const textContent = await component.textContent();
    await expect(component).toContainText("3. mars");
  });

  test("skal formatere dato i kort format", async ({ mount }) => {
    const dato = "2025-03-03";
    const component = await mount(<FormattertDato dato={dato} kort={true} />);
    const textContent = await component.textContent();
    await expect(component).toContainText("3.3.");
  });
});
