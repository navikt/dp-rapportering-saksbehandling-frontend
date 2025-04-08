import { render } from "@testing-library/react";
import { addDays } from "date-fns";
import { describe, expect, test } from "vitest";

import { Innsendt } from "~/components/rapporteringsperiode-liste/Innsendt";
import { SISTE_FRIST } from "~/components/rapporteringsperiode-liste/Innsendt";
import { formatereDato } from "~/mocks/mock-rapporteringsperioder.utils";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";

describe("Innsendt", () => {
  test("skal vise error tag hvis SISTE_FRIST er passert", () => {
    const tilOgMed = "2025-02-09";
    const mottattDato = formatereDato(addDays(new Date(tilOgMed), SISTE_FRIST + 1));

    const { container } = render(
      <Innsendt
        mottattDato={mottattDato}
        tilOgMed={tilOgMed}
        sisteFristForTrekk={tilOgMed}
        status={RAPPORTERINGSPERIODE_STATUS.Feilet}
      />
    );

    expect(container.querySelector(".navds-tag--error")).toBeInTheDocument();
  });

  test("skal ikke vise error tag hvis SISTE_FRIST ikke er passert", () => {
    const tilOgMed = "2025-02-09";
    const mottattDato = formatereDato(addDays(new Date(tilOgMed), 1));

    const { container } = render(
      <Innsendt
        mottattDato={mottattDato}
        tilOgMed={tilOgMed}
        sisteFristForTrekk={null}
        status={RAPPORTERINGSPERIODE_STATUS.Ferdig}
      />
    );
    expect(container.querySelector(".navds-tag--neutral")).toBeInTheDocument();
  });
});
