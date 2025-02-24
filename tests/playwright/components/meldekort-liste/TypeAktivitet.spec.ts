import { test, expect } from "@playwright/experimental-ct-react";
import { TypeAktivitet } from "../../../../app/components/meldekort-liste/TypeAktivitet";
import periode from "~/mocks/responses/rapporteringsperioder";

test("TypeAktivitet", async ({ mount }) => {
  const component = await mount(<TypeAktivitet periode={periode} />);
});
