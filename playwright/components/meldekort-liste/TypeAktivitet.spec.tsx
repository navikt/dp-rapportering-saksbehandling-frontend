import { test, expect } from "@playwright/experimental-ct-react";
import { TypeAktivitet } from "~/components/meldekort-liste/TypeAktivitet";
import { aktivitetMapping } from "~/components/meldekort-liste/utils";
import periode from "../../../mocks/responses/rapporteringsperioder";

test.describe("TypeAktivitet", () => {
  test("skal vise alle aktivitetstypene", async ({ mount }) => {
    const component = await mount(<TypeAktivitet periode={periode[1]} />);

    await expect(component).toContainText(aktivitetMapping.Arbeid.label);
    await expect(component).toContainText(aktivitetMapping.Syk.label);
    await expect(component).toContainText(aktivitetMapping.Fravaer.label);
    await expect(component).toContainText(aktivitetMapping.Utdanning.label);
  });
});
