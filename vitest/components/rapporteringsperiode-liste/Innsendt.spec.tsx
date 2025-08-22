import { render, screen } from "@testing-library/react";
import { addDays } from "date-fns";
import { describe, expect, test } from "vitest";

import { Innsendt } from "~/components/rapporteringsperiode-liste/Innsendt";
import { formatereDato } from "~/mocks/mock-rapporteringsperioder.utils";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

describe("Innsendt", () => {
  const createMockPeriode = (
    overrides: Partial<IRapporteringsperiode> = {},
  ): IRapporteringsperiode => {
    const tilOgMed = "2025-02-09";
    const sisteFrist = "2025-02-16"; // 7 dager etter periode slutt
    return {
      id: "test-periode",
      personId: "test-person-123",
      ident: "12345678901",
      type: "meldekort",
      periode: {
        fraOgMed: "2025-02-03",
        tilOgMed,
      },
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      innsendtTidspunkt: formatereDato(new Date(tilOgMed)) as string,
      registrertArbeidssoker: true,
      begrunnelse: undefined,
      sisteFristForTrekk: sisteFrist,
      dager: [],
      kanSendes: false,
      kanEndres: false,
      kanSendesFra: "2025-02-10",
      opprettetAv: "test-user",
      korrigering: null,
      kilde: null,
      ...overrides,
    };
  };

  test("skal vise error tag hvis sisteFristForTrekk er passert", () => {
    const sisteFrist = "2025-02-16";
    const innsendtTidspunkt = formatereDato(addDays(new Date(sisteFrist), 1)); // 1 dag for sent
    const mottatDatoFormattert = formatterDato({ dato: innsendtTidspunkt });
    const periode = createMockPeriode({
      innsendtTidspunkt,
      sisteFristForTrekk: sisteFrist,
    });

    render(<Innsendt periode={periode} />);

    expect(screen.getByText(mottatDatoFormattert)).toBeInTheDocument();
  });

  test("skal ikke vise error tag for korrigering selv om sisteFristForTrekk er passert", () => {
    const sisteFrist = "2025-02-16";
    const innsendtTidspunkt = formatereDato(addDays(new Date(sisteFrist), 1)); // 1 dag for sent
    const mottatDatoFormattert = formatterDato({ dato: innsendtTidspunkt });
    const periode = createMockPeriode({
      innsendtTidspunkt,
      sisteFristForTrekk: sisteFrist,
      korrigering: {
        korrigererMeldekortId: "original-id",
      },
    });

    render(<Innsendt periode={periode} />);

    expect(screen.getByText(mottatDatoFormattert)).toBeInTheDocument();
    expect(screen.queryByRole("generic", { name: /error/i })).not.toBeInTheDocument();
  });

  test("skal ikke vise error tag for saksbehandler utfylling selv om sisteFristForTrekk er passert", () => {
    const sisteFrist = "2025-02-16";
    const innsendtTidspunkt = formatereDato(addDays(new Date(sisteFrist), 1)); // 1 dag for sent
    const mottatDatoFormattert = formatterDato({ dato: innsendtTidspunkt });
    const periode = createMockPeriode({
      innsendtTidspunkt,
      sisteFristForTrekk: sisteFrist,
      kilde: {
        rolle: "Saksbehandler",
        ident: "test-saksbehandler",
      },
    });

    render(<Innsendt periode={periode} />);

    expect(screen.getByText(mottatDatoFormattert)).toBeInTheDocument();
    expect(screen.queryByRole("generic", { name: /error/i })).not.toBeInTheDocument();
  });

  test("skal returnere null for perioder som er til utfylling", () => {
    const periode = createMockPeriode({
      status: RAPPORTERINGSPERIODE_STATUS.Klar,
      innsendtTidspunkt: undefined,
    });

    const { container } = render(<Innsendt periode={periode} />);

    expect(container.firstChild).toBeNull();
  });
});
