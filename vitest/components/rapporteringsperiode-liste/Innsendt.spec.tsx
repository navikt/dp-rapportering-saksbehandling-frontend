import { render, screen } from "@testing-library/react";
import { addDays } from "date-fns";
import { describe, expect, test } from "vitest";

import { Innsendt } from "~/components/rapporteringsperiode-liste/Innsendt";
import { SISTE_FRIST } from "~/components/rapporteringsperiode-liste/Innsendt";
import { formatereDato } from "~/mocks/mock-rapporteringsperioder.utils";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";

describe("Innsendt", () => {
  test("skal vise error tag hvis SISTE_FRIST er passert", () => {
    const tilOgMed = "2025-02-09";
    const innsendtTidspunkt = formatereDato(addDays(new Date(tilOgMed), SISTE_FRIST + 1));
    const mottatDatoFormattert = formatterDato({ dato: innsendtTidspunkt });

    render(
      <Innsendt
        innsendtTidspunkt={innsendtTidspunkt}
        tilOgMed={tilOgMed}
        status={RAPPORTERINGSPERIODE_STATUS.Innsendt}
      />,
    );

    expect(screen.getByText(mottatDatoFormattert)).toBeInTheDocument();
  });
});
