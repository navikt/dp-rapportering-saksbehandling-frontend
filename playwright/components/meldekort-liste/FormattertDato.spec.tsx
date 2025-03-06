import { test, expect } from "@playwright/experimental-ct-react";
import { Dato } from "~/components/rapporteringsperiode-liste/Dato";
import perioder from "~/mocks/responses/rapporteringsperioder";

test.describe("FormattertDato", () => {
  test("skal formatere dato i lang format", async ({ mount }) => {
    const component = await mount(<Dato periode={perioder[0]} />);
    await expect(component).toContainText("27. januar - 9. februar");
  });

  test("skal formatere dato i kort format", async ({ mount }) => {
    const component = await mount(<Dato periode={perioder[0]} kort={true} />);
    await expect(component).toContainText("27.01.25 - 09.02.25");
  });
});
