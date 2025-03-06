import { test, expect } from "@playwright/experimental-ct-react";
import { Status } from "~/components/rapporteringsperiode-liste/Status";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";

test.describe("Status", () => {
  test("skal vise info tag for status TilUtfylling", async ({ mount }) => {
    const component = await mount(<Status status={RAPPORTERINGSPERIODE_STATUS.TilUtfylling} />);
    await expect(component).toHaveClass(/(^|\s)navds-tag--info(\s|$)/g);
    await expect(component).toContainText(RAPPORTERINGSPERIODE_STATUS.TilUtfylling);
  });

  test("skal vise success tag for status Innsendt", async ({ mount }) => {
    const component = await mount(<Status status={RAPPORTERINGSPERIODE_STATUS.Innsendt} />);
    await expect(component).toHaveClass(/(^|\s)navds-tag--success(\s|$)/g);
    await expect(component).toContainText(RAPPORTERINGSPERIODE_STATUS.Innsendt);
  });

  test("skal vise warning tag for status Endret", async ({ mount }) => {
    const component = await mount(<Status status={RAPPORTERINGSPERIODE_STATUS.Endret} />);
    await expect(component).toHaveClass(/(^|\s)navds-tag--warning(\s|$)/g);
    await expect(component).toContainText(RAPPORTERINGSPERIODE_STATUS.Endret);
  });

  test("skal vise success tag for status Ferdig", async ({ mount }) => {
    const component = await mount(<Status status={RAPPORTERINGSPERIODE_STATUS.Ferdig} />);
    await expect(component).toHaveClass(/(^|\s)navds-tag--success(\s|$)/g);
    await expect(component).toContainText(RAPPORTERINGSPERIODE_STATUS.Ferdig);
  });

  test("skal vise error tag for status Feilet", async ({ mount }) => {
    const component = await mount(<Status status={RAPPORTERINGSPERIODE_STATUS.Feilet} />);
    await expect(component).toHaveClass(/(^|\s)navds-tag--error(\s|$)/g);
    await expect(component).toContainText(RAPPORTERINGSPERIODE_STATUS.Feilet);
  });
});
