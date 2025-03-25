import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TypeAktivitet } from "~/components/rapporteringsperiode-liste/TypeAktivitet";
import { aktivitetMapping } from "~/components/rapporteringsperiode-liste/utils";
import { lagRapporteringsperiode } from "~/mocks/mock-rapporteringsperioder.utils";
import { AKTIVITET_TYPE } from "~/utils/constants";

describe("TypeAktivitet", () => {
  test("skal vise alle aktivitetstypene", () => {
    render(
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

    const arbeid = screen.getByText(aktivitetMapping.Arbeid.label);
    const syk = screen.getByText(aktivitetMapping.Syk.label);
    const fravaer = screen.getByText(aktivitetMapping.Fravaer.label);
    const utdanning = screen.getByText(aktivitetMapping.Utdanning.label);

    expect(arbeid).toBeInTheDocument();
    expect(syk).toBeInTheDocument();
    expect(fravaer).toBeInTheDocument();
    expect(utdanning).toBeInTheDocument();
  });
});
