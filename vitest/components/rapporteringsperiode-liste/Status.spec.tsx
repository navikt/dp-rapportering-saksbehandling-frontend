import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Status } from "~/components/rapporteringsperiode-liste/Status";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode, TRapporteringsperiodeStatus } from "~/utils/types";

const createMockPeriode = (
  status: TRapporteringsperiodeStatus,
  overrides?: Partial<IRapporteringsperiode>,
): IRapporteringsperiode => ({
  id: "test-id",
  ident: "test-ident",
  personId: "test-person-id",
  status,
  type: "test-type",
  periode: {
    fraOgMed: "2025-01-01",
    tilOgMed: "2025-01-14",
  },
  dager: [],
  kanSendes: true,
  kanEndres: true,
  kanSendesFra: "2025-01-15",
  sisteFristForTrekk: "2025-01-20",
  opprettetAv: "test-user",
  kilde: null,
  innsendtTidspunkt: null,
  meldedato: null,
  registrertArbeidssoker: null,
  originalMeldekortId: null,
  begrunnelse: "",
  ...overrides,
});

describe("Status", () => {
  test("skal vise info tag for status TilUtfylling", () => {
    const mockPeriode = createMockPeriode(RAPPORTERINGSPERIODE_STATUS.TilUtfylling);
    const { container } = render(<Status periode={mockPeriode} />);

    expect(container.querySelector(".navds-tag--info")).toBeInTheDocument();

    const text = screen.getByText("Klar til utfylling");
    expect(text).toBeInTheDocument();
  });

  test("skal vise success tag for status Innsendt", () => {
    const mockPeriode = createMockPeriode(RAPPORTERINGSPERIODE_STATUS.Innsendt);
    const { container } = render(<Status periode={mockPeriode} />);

    expect(container.querySelector(".navds-tag--success")).toBeInTheDocument();

    const text = screen.getByText("Innsendt");
    expect(text).toBeInTheDocument();
  });

  test("skal vise korrigert tag når periode er korrigert", () => {
    const mockPeriode = createMockPeriode(RAPPORTERINGSPERIODE_STATUS.Innsendt, {
      originalMeldekortId: "original-id",
      begrunnelse: "Korrigering begrunnelse",
    });
    const { container } = render(<Status periode={mockPeriode} />);

    expect(screen.getByText("Innsendt")).toBeInTheDocument();
    expect(screen.getByText("Korrigert")).toBeInTheDocument();
    expect(container.querySelector(".navds-tag--warning")).toBeInTheDocument();
  });

  test("skal ikke vise korrigert tag når periode ikke er korrigert", () => {
    const mockPeriode = createMockPeriode(RAPPORTERINGSPERIODE_STATUS.Innsendt);
    render(<Status periode={mockPeriode} />);

    expect(screen.getByText("Innsendt")).toBeInTheDocument();
    expect(screen.queryByText("Korrigert")).not.toBeInTheDocument();
  });
});
