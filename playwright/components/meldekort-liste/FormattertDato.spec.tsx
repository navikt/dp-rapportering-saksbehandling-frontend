import { expect, test } from "@playwright/experimental-ct-react";

import { Dato } from "~/components/meldekort-liste/Dato";
import perioder from "~/mocks/data/mock-rapporteringsperioder";

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
