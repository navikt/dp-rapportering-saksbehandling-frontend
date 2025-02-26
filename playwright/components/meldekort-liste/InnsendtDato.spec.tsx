import { test, expect } from "@playwright/experimental-ct-react";
import { differenceInDays, parseISO } from "date-fns";

import { InnsendtDato } from "~/components/meldekort-liste/InnsendtDato";
import { SISTE_FRIST } from "~/components/meldekort-liste/InnsendtDato";

test("skal vise error tag hvis SISTE_FRIST er passert", async ({ mount }) => {
  const mottattDato = "2025-02-20";
  const tilOgMed = "2025-02-09";
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  const component = await mount(<InnsendtDato mottattDato={mottattDato} tilOgMed={tilOgMed} />);
  await expect(component).toHaveClass(/(^|\s)navds-tag--error(\s|$)/g);

  expect(forSent).toBeTruthy();
});

test("skal ikke vise error tag hvis SISTE_FRIST ikke er passert", async ({ mount }) => {
  const mottattDato = "2025-02-10";
  const tilOgMed = "2025-02-09";
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  const component = await mount(<InnsendtDato mottattDato={mottattDato} tilOgMed={tilOgMed} />);

  await expect(component.locator("[data-testid='error-tag']")).not.toBeVisible();
  expect(forSent).toBeFalsy();
});
