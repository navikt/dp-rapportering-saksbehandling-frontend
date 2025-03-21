import { expect, test } from "@playwright/experimental-ct-react";

import { Dato } from "~/components/rapporteringsperiode-liste/Dato";
import { lagRapporteringsperiode } from "~/mocks/mock-rapporteringsperioder.utils";

test.describe("FormattertDato", () => {
  const fraOgMed = "2025-01-27";
  const tilOgMed = "2025-02-09";

  const periode = lagRapporteringsperiode({
    periode: { fraOgMed, tilOgMed },
  });

  test("skal formatere dato i lang format", async ({ mount }) => {
    const component = await mount(<Dato periode={periode} />);
    await expect(component).toContainText("27. januar - 9. februar");
  });

  test("skal formatere dato i kort format", async ({ mount }) => {
    const component = await mount(<Dato periode={periode} kort={true} />);
    await expect(component).toContainText("27.01.25 - 09.02.25");
  });
});
