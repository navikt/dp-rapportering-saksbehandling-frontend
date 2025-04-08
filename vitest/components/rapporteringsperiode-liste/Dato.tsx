import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Dato } from "~/components/rapporteringsperiode-liste/Dato";
import { lagRapporteringsperiode } from "~/mocks/mock.utils";

describe("Dato", () => {
  const fraOgMed = "2025-01-27";
  const tilOgMed = "2025-02-09";

  const periode = lagRapporteringsperiode({
    periode: { fraOgMed, tilOgMed },
  });

  test("skal formatere dato i lang format", () => {
    render(<Dato periode={periode} />);
    const text = screen.getByText("27. januar - 9. februar");

    expect(text).toBeInTheDocument();
  });

  test("skal formatere dato i kort format", () => {
    render(<Dato periode={periode} kort={true} />);
    const text = screen.getByText("27.01.25 - 09.02.25");

    expect(text).toBeInTheDocument();
  });
});
