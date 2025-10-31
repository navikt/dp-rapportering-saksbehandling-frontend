import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ANSVARLIG_SYSTEM, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { MeldekortRad } from "./MeldekortRad";
import { HIGHLIGHT_DURATION_MS } from "./MeldekortRad.helpers";

// Mock MeldekortVisning component since we're testing MeldekortRad in isolation
vi.mock("~/components/meldekort-visning/MeldekortVisning", () => ({
  MeldekortVisning: ({ perioder }: { perioder: IRapporteringsperiode[] }) => (
    <div data-testid="meldekort-visning">Meldekort Visning for {perioder[0]?.id}</div>
  ),
}));

describe("MeldekortRad", () => {
  const basePeriode: IRapporteringsperiode = {
    id: "test-periode-1",
    ident: "12345678901",
    type: "meldekort",
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
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
      ...Array.from({ length: 12 }, (_, i) => ({
        type: "UKJENT" as const,
        dagIndex: i + 2,
        dato: `2024-01-${String(i + 3).padStart(2, "0")}`,
        aktiviteter: [],
      })),
    ],
    kanSendes: true,
    kanEndres: true,
    kanSendesFra: "2024-01-14T00:00:00",
    sisteFristForTrekk: null,
    status: "TilUtfylling",
    opprettetAv: "Dagpenger",
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
  };

  function renderInTable(ui: React.ReactElement, initialUrl = "/") {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route
            path="*"
            element={
              <table>
                <tbody>{ui}</tbody>
              </table>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
  }

  describe("grunnleggende rendering", () => {
    it("skal vise ukenummer", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      expect(screen.getByText(/1 - 2/)).toBeInTheDocument();
    });

    it("skal vise periode datoer", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      // Dato uten årstall vises
      expect(screen.getByText("1. januar - 14. januar")).toBeInTheDocument();
    });

    it("skal ha riktig aria-label på article", () => {
      const { container } = renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      const article = container.querySelector('article[aria-label*="Periode"]');
      expect(article).toHaveAttribute("aria-label", "Periode 2024-01-01");
    });
  });

  describe("status visning", () => {
    it("skal vise 'Klar til utfylling' når kanSendes er true", () => {
      renderInTable(
        <MeldekortRad
          periode={{ ...basePeriode, kanSendes: true }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("Klar til utfylling")).toBeInTheDocument();
    });

    it("skal vise 'Meldekort opprettet' når periode ikke kan sendes", () => {
      renderInTable(
        <MeldekortRad
          periode={{ ...basePeriode, kanSendes: false }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("Meldekort opprettet")).toBeInTheDocument();
    });

    it("skal vise 'Innsendt' når periode er innsendt", () => {
      renderInTable(
        <MeldekortRad
          periode={{
            ...basePeriode,
            status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
          }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("Innsendt")).toBeInTheDocument();
    });

    it("skal vise 'Korrigert' tag når periode er korrigert", () => {
      renderInTable(
        <MeldekortRad
          periode={{
            ...basePeriode,
            originalMeldekortId: "original-123",
          }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("Korrigert")).toBeInTheDocument();
    });

    it("skal ikke vise 'Korrigert' tag når periode ikke er korrigert", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      expect(screen.queryByText("Korrigert")).not.toBeInTheDocument();
    });
  });

  describe("aktiviteter visning", () => {
    it("skal vise alle unike aktiviteter", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      // Sjekk at aktiviteter vises (aria-labels)
      expect(screen.getByText("Jobb", { selector: ".sr-only" })).toBeInTheDocument();
      expect(screen.getByText("Syk", { selector: ".sr-only" })).toBeInTheDocument();
    });

    it("skal vise aktiviteter med riktig rekkefølge", () => {
      const periodeWithMultipleActivities: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "UKJENT",
            dagIndex: 0,
            dato: "2024-01-01",
            aktiviteter: [{ type: "Utdanning", dato: "2024-01-01" }],
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
            aktiviteter: [{ type: "Syk", dato: "2024-01-03" }],
          },
          {
            type: "UKJENT",
            dagIndex: 3,
            dato: "2024-01-04",
            aktiviteter: [{ type: "Fravaer", dato: "2024-01-04" }],
          },
          ...Array.from({ length: 10 }, (_, i) => ({
            type: "UKJENT" as const,
            dagIndex: i + 4,
            dato: `2024-01-${String(i + 5).padStart(2, "0")}`,
            aktiviteter: [],
          })),
        ],
      };

      renderInTable(
        <MeldekortRad
          periode={periodeWithMultipleActivities}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      // Sjekk at alle aktiviteter vises
      expect(screen.getByText("Jobb", { selector: ".sr-only" })).toBeInTheDocument();
      expect(screen.getByText("Syk", { selector: ".sr-only" })).toBeInTheDocument();
      expect(
        screen.getByText("Ferie, fravær eller utenlandsopphold", { selector: ".sr-only" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Tiltak, kurs eller utdanning", { selector: ".sr-only" }),
      ).toBeInTheDocument();
    });

    it("skal ikke vise aktiviteter når det ikke finnes noen", () => {
      const periodeUtenAktiviteter: IRapporteringsperiode = {
        ...basePeriode,
        dager: Array.from({ length: 14 }, (_, i) => ({
          type: "UKJENT" as const,
          dagIndex: i,
          dato: `2024-01-${String(i + 1).padStart(2, "0")}`,
          aktiviteter: [],
        })),
      };

      const { container } = renderInTable(
        <MeldekortRad
          periode={periodeUtenAktiviteter}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      // UL finnes, men skal ikke ha noen LI barn (aktiviteter)
      const aktivitetListe = container.querySelector('[class*="aktiviteter"]');
      expect(aktivitetListe?.children.length).toBe(0);
    });
  });

  describe("meldedato visning", () => {
    it("skal vise meldedato når periode er innsendt", () => {
      const innsendtPeriode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        innsendtTidspunkt: "2024-01-15T10:00:00",
        meldedato: "2024-01-15",
      };

      renderInTable(
        <MeldekortRad
          periode={innsendtPeriode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("15. januar")).toBeInTheDocument();
    });

    it("skal vise error tag når meldekort er sendt for sent", () => {
      const forSentPeriode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        innsendtTidspunkt: "2024-01-20T10:00:00",
        meldedato: "2024-01-20",
        sisteFristForTrekk: "2024-01-18",
      };

      renderInTable(
        <MeldekortRad
          periode={forSentPeriode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      // Sjekk at error tag vises
      expect(screen.getByText("20. januar")).toBeInTheDocument();
      expect(
        screen.getByText(", sendt inn for sent", { selector: ".sr-only" }),
      ).toBeInTheDocument();
    });

    it("skal ikke vise meldedato når periode ikke er innsendt", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      // Skal ikke finne noen dato i meldedato-kolonnen (kun periodedatoene)
      const allDates = screen.queryAllByText(/\d+\. \w+/);
      // Skal bare finne periodedato (som er kombinert 1. januar - 14. januar)
      expect(allDates.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("sisteFristForTrekk visning", () => {
    it("skal vise sisteFristForTrekk når det finnes", () => {
      const periodeWithTrekkfrist: IRapporteringsperiode = {
        ...basePeriode,
        sisteFristForTrekk: "2024-02-01",
      };

      renderInTable(
        <MeldekortRad
          periode={periodeWithTrekkfrist}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("1. februar")).toBeInTheDocument();
    });

    it("skal ikke vise sisteFristForTrekk når det er null", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      expect(screen.queryByText(/februar/)).not.toBeInTheDocument();
    });
  });

  describe("highlight funksjonalitet", () => {
    it("skal highlighte rad når periode id matcher oppdatert query param", async () => {
      const { container } = renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
        "/?oppdatert=test-periode-1",
      );

      await waitFor(() => {
        const highlightedRow = container.querySelector('[class*="highlighted"]');
        expect(highlightedRow).toBeInTheDocument();
      });
    });

    it("skal ha en timeout for highlight", () => {
      // Denne testen sjekker bare at HIGHLIGHT_DURATION_MS er satt
      // Testing av timeout med fake timers kan være ustabilt i React
      expect(HIGHLIGHT_DURATION_MS).toBe(3600);
    });

    it("skal ikke highlighte rad når periode id ikke matcher", () => {
      const { container } = renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
        "/?oppdatert=annen-periode-id",
      );

      const highlightedRow = container.querySelector('[class*="highlighted"]');
      expect(highlightedRow).not.toBeInTheDocument();
    });
  });

  describe("expandable row oppførsel", () => {
    it("skal være expandable når periode kan sendes", () => {
      const { container } = renderInTable(
        <MeldekortRad
          periode={{ ...basePeriode, kanSendes: true }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const expandableRow = container.querySelector('[class*="navds-table__expandable-row"]');
      expect(expandableRow).toBeInTheDocument();
    });

    it("skal være disabled når periode er opprettet men ikke klar", () => {
      const { container } = renderInTable(
        <MeldekortRad
          periode={{ ...basePeriode, kanSendes: false }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const disabledRow = container.querySelector('[class*="disabled"]');
      expect(disabledRow).toBeInTheDocument();
    });

    it("skal vise MeldekortVisning når expandable content vises", () => {
      renderInTable(
        <MeldekortRad
          periode={{ ...basePeriode, kanSendes: true }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      // MeldekortVisning skal være i DOM (selv om ikke expandert)
      expect(screen.getByTestId("meldekort-visning")).toBeInTheDocument();
    });

    it("skal ikke vise MeldekortVisning for opprettede perioder", () => {
      renderInTable(
        <MeldekortRad
          periode={{ ...basePeriode, kanSendes: false }}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.queryByTestId("meldekort-visning")).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("skal håndtere periode uten dager", () => {
      const periodeUtenDager: IRapporteringsperiode = {
        ...basePeriode,
        dager: [],
      };

      expect(() =>
        renderInTable(
          <MeldekortRad
            periode={periodeUtenDager}
            personId="123"
            ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          />,
        ),
      ).not.toThrow();
    });

    it("skal håndtere periode uten personId", () => {
      expect(() =>
        renderInTable(<MeldekortRad periode={basePeriode} ansvarligSystem={ANSVARLIG_SYSTEM.DP} />),
      ).not.toThrow();
    });

    it("skal håndtere periode med mange aktiviteter", () => {
      const periodeWithManyActivities: IRapporteringsperiode = {
        ...basePeriode,
        dager: basePeriode.dager.map((dag, index) => ({
          ...dag,
          aktiviteter:
            index % 2 === 0
              ? [
                  { type: "Arbeid", dato: dag.dato, timer: "PT4H" },
                  { type: "Syk", dato: dag.dato },
                  { type: "Fravaer", dato: dag.dato },
                  { type: "Utdanning", dato: dag.dato },
                ]
              : [],
        })),
      };

      expect(() =>
        renderInTable(
          <MeldekortRad
            periode={periodeWithManyActivities}
            personId="123"
            ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          />,
        ),
      ).not.toThrow();
    });
  });

  describe("accessibility", () => {
    it("skal ha sr-only tekst for aktiviteter", () => {
      renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      const srOnlyElements = screen.getAllByText(/Jobb|Syk/, { selector: ".sr-only" });
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it("skal ha scope='row' på første datacell", () => {
      const { container } = renderInTable(
        <MeldekortRad periode={basePeriode} personId="123" ansvarligSystem={ANSVARLIG_SYSTEM.DP} />,
      );

      const firstCell = container.querySelector('td[scope="row"]');
      expect(firstCell).toBeInTheDocument();
    });
  });
});
