import { expect, test } from "@playwright/experimental-ct-react";

import { TypeAktivitet } from "~/components/rapporteringsperiode-liste/TypeAktivitet";
import { aktivitetMapping } from "~/components/rapporteringsperiode-liste/utils";
import { lagRapporteringsperiode } from "~/mocks/mock-rapporteringsperioder.utils";
import { AKTIVITET_TYPE } from "~/utils/constants";

test.describe("TypeAktivitet", () => {
  test("skal vise alle aktivitetstypene", async ({ mount }) => {
    const component = await mount(
      <TypeAktivitet
        periode={lagRapporteringsperiode({
          dager: [
            {
              dagIndex: 0,
              dato: "2025-01-01",
              aktiviteter: [
                {
                  type: AKTIVITET_TYPE.Arbeid,
                  dato: "2025-01-01",
                  timer: "PT2H",
                },
                {
                  type: AKTIVITET_TYPE.Fravaer,
                  dato: "2025-01-01",
                },
                {
                  type: AKTIVITET_TYPE.Syk,
                  dato: "2025-01-01",
                },
                {
                  type: AKTIVITET_TYPE.Utdanning,
                  dato: "2025-01-01",
                },
              ],
            },
          ],
        })}
      />
    );

    await expect(component).toContainText(aktivitetMapping.Arbeid.label);
    await expect(component).toContainText(aktivitetMapping.Syk.label);
    await expect(component).toContainText(aktivitetMapping.Fravaer.label);
    await expect(component).toContainText(aktivitetMapping.Utdanning.label);
  });
});
