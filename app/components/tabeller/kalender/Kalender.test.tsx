import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Kalender } from "~/components/tabeller/kalender/Kalender";
import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

describe("Kalender", () => {
  const mockPeriode: IRapporteringsperiode = {
    id: "test-periode-1",
    ident: "12345678901",
    type: MELDEKORT_TYPE.ORDINAERT,
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [
      // Første uke (7 dager)
      {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-01",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-01", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 1,
        dato: "2024-01-02",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-02", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 2,
        dato: "2024-01-03",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-03", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 3,
        dato: "2024-01-04",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-04", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 4,
        dato: "2024-01-05",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-05", timer: "PT7H30M" }],
      },
      { type: "UKJENT", dagIndex: 5, dato: "2024-01-06", aktiviteter: [] },
      { type: "UKJENT", dagIndex: 6, dato: "2024-01-07", aktiviteter: [] },
      // Andre uke (7 dager)
      {
        type: "UKJENT",
        dagIndex: 7,
        dato: "2024-01-08",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-08", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 8,
        dato: "2024-01-09",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-09", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 9,
        dato: "2024-01-10",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-10", timer: "PT7H30M" }],
      },
      {
        type: "UKJENT",
        dagIndex: 10,
        dato: "2024-01-11",
        aktiviteter: [{ type: "Syk", dato: "2024-01-11" }],
      },
      {
        type: "UKJENT",
        dagIndex: 11,
        dato: "2024-01-12",
        aktiviteter: [{ type: "Syk", dato: "2024-01-12" }],
      },
      { type: "UKJENT", dagIndex: 12, dato: "2024-01-13", aktiviteter: [] },
      { type: "UKJENT", dagIndex: 13, dato: "2024-01-14", aktiviteter: [] },
    ],
    kanSendes: true,
    kanEndres: true,
    kanSendesFra: "2024-01-14T00:00:00",
    sisteFristForTrekk: null,
    status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
    opprettetAv: OPPRETTET_AV.Dagpenger,
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
  };

  it("skal rendre kalender med alle dager", () => {
    render(<Kalender periode={mockPeriode} />);

    // Sjekk at alle ukedager vises
    expect(screen.getByText("Man")).toBeInTheDocument();
    expect(screen.getByText("Tir")).toBeInTheDocument();
    expect(screen.getByText("Ons")).toBeInTheDocument();
    expect(screen.getByText("Tor")).toBeInTheDocument();
    expect(screen.getByText("Fre")).toBeInTheDocument();
    expect(screen.getByText("Lør")).toBeInTheDocument();
    expect(screen.getByText("Søn")).toBeInTheDocument();
  });

  it("skal vise alle 14 dager i perioden", () => {
    const { container } = render(<Kalender periode={mockPeriode} />);

    const dagElements = container.querySelectorAll('[class*="dagWrapper"]');
    expect(dagElements).toHaveLength(14);
  });

  it("skal vise datoer korrekt", () => {
    const { container } = render(<Kalender periode={mockPeriode} />);

    // Sjekk at datoer vises
    const datoElements = container.querySelectorAll('[class*="dato"]');
    expect(datoElements.length).toBeGreaterThan(0);
  });

  it("skal vise aktiviteter for dager med aktivitet", () => {
    render(<Kalender periode={mockPeriode} />);

    // Sjekk at arbeid vises
    const jobbElements = screen.getAllByText(/Jobb \d+\.?\d*t/);
    expect(jobbElements.length).toBeGreaterThan(0);

    // Sjekk at syk vises
    const sykElements = screen.getAllByText("Syk");
    expect(sykElements).toHaveLength(2); // 2 sykedager i mockPeriode
  });

  it("skal returnere null hvis periode mangler", () => {
    // Test at komponenten håndterer null/undefined periode gracefully
    // Vi bruker undefined i stedet for null siden TypeScript ikke tillater null
    const { container } = render(
      <Kalender periode={undefined as unknown as IRapporteringsperiode} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("skal vise mellomrom mellom ukene", () => {
    const { container } = render(<Kalender periode={mockPeriode} />);

    const mellomromElements = container.querySelectorAll('[class*="mellomrom"]');
    expect(mellomromElements).toHaveLength(1);
  });

  it("skal vise tabellstruktur korrekt", () => {
    const { container } = render(<Kalender periode={mockPeriode} />);

    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(container.querySelector("tbody")).toBeInTheDocument();
  });

  describe("tilgjengelighet", () => {
    it("skal ha caption for skjermlesere", () => {
      render(<Kalender periode={mockPeriode} />);

      const caption = screen.getByText("Oversikt over rapporterte dager for perioden");
      expect(caption).toBeInTheDocument();
      expect(caption).toHaveClass("sr-only");
    });

    it("skal ha skjermleservennlige ukedagnavn", () => {
      render(<Kalender periode={mockPeriode} />);

      expect(screen.getByText("mandag")).toBeInTheDocument();
      expect(screen.getByText("tirsdag")).toBeInTheDocument();
      expect(screen.getByText("onsdag")).toBeInTheDocument();
      expect(screen.getByText("torsdag")).toBeInTheDocument();
      expect(screen.getByText("fredag")).toBeInTheDocument();
      expect(screen.getByText("lørdag")).toBeInTheDocument();
      expect(screen.getByText("søndag")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("skal håndtere periode med bare tomme dager", () => {
      const periodeUtenAktiviteter: IRapporteringsperiode = {
        ...mockPeriode,
        dager: Array.from({ length: 14 }, (_, i) => ({
          type: "UKJENT",
          dagIndex: i,
          dato: `2024-01-${String(i + 1).padStart(2, "0")}`,
          aktiviteter: [],
        })),
      };

      const { container } = render(<Kalender periode={periodeUtenAktiviteter} />);
      const dagElements = container.querySelectorAll('[class*="dagWrapper"]');
      expect(dagElements).toHaveLength(14);
    });

    it("skal håndtere periode med bare aktivitetsdager", () => {
      const periodeMedKunAktiviteter: IRapporteringsperiode = {
        ...mockPeriode,
        dager: Array.from({ length: 14 }, (_, i) => {
          const dato = `2024-01-${String(i + 1).padStart(2, "0")}`;
          return {
            type: "UKJENT",
            dagIndex: i,
            dato,
            aktiviteter: [{ type: "Arbeid", dato, timer: "PT7H30M" }],
          };
        }),
      };

      render(<Kalender periode={periodeMedKunAktiviteter} />);

      const jobbElements = screen.getAllByText(/Jobb \d+\.?\d*t/);
      expect(jobbElements).toHaveLength(14);
    });

    it("skal håndtere periode med blandede aktivitetstyper", () => {
      const periodeMedBlandetAktiviteter: IRapporteringsperiode = {
        ...mockPeriode,
        dager: [
          {
            type: "UKJENT",
            dagIndex: 0,
            dato: "2024-01-01",
            aktiviteter: [{ type: "Arbeid", dato: "2024-01-01", timer: "PT7H30M" }],
          },
          {
            type: "UKJENT",
            dagIndex: 1,
            dato: "2024-01-02",
            aktiviteter: [{ type: "Syk", dato: "2024-01-02" }],
          },
          {
            type: "UKJENT",
            dagIndex: 2,
            dato: "2024-01-03",
            aktiviteter: [{ type: "Fravaer", dato: "2024-01-03" }],
          },
          {
            type: "UKJENT",
            dagIndex: 3,
            dato: "2024-01-04",
            aktiviteter: [{ type: "Utdanning", dato: "2024-01-04" }],
          },
          {
            type: "UKJENT",
            dagIndex: 4,
            dato: "2024-01-05",
            aktiviteter: [
              { type: "Arbeid", dato: "2024-01-05", timer: "PT4H" },
              { type: "Syk", dato: "2024-01-05" },
            ],
          },
          { type: "UKJENT", dagIndex: 5, dato: "2024-01-06", aktiviteter: [] },
          { type: "UKJENT", dagIndex: 6, dato: "2024-01-07", aktiviteter: [] },
          {
            type: "UKJENT",
            dagIndex: 7,
            dato: "2024-01-08",
            aktiviteter: [{ type: "Arbeid", dato: "2024-01-08", timer: "PT7H30M" }],
          },
          {
            type: "UKJENT",
            dagIndex: 8,
            dato: "2024-01-09",
            aktiviteter: [{ type: "Arbeid", dato: "2024-01-09", timer: "PT7H30M" }],
          },
          {
            type: "UKJENT",
            dagIndex: 9,
            dato: "2024-01-10",
            aktiviteter: [{ type: "Arbeid", dato: "2024-01-10", timer: "PT7H30M" }],
          },
          {
            type: "UKJENT",
            dagIndex: 10,
            dato: "2024-01-11",
            aktiviteter: [{ type: "Arbeid", dato: "2024-01-11", timer: "PT7H30M" }],
          },
          {
            type: "UKJENT",
            dagIndex: 11,
            dato: "2024-01-12",
            aktiviteter: [{ type: "Arbeid", dato: "2024-01-12", timer: "PT7H30M" }],
          },
          { type: "UKJENT", dagIndex: 12, dato: "2024-01-13", aktiviteter: [] },
          { type: "UKJENT", dagIndex: 13, dato: "2024-01-14", aktiviteter: [] },
        ],
      };

      render(<Kalender periode={periodeMedBlandetAktiviteter} />);

      expect(screen.getAllByText(/Jobb/).length).toBeGreaterThan(0);
      expect(screen.getAllByText("Syk").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ferie").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Utdanning").length).toBeGreaterThan(0);
    });
  });
});
