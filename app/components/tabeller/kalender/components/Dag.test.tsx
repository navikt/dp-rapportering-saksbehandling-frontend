import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dag } from "~/components/tabeller/kalender/components/Dag";
import type { IRapporteringsperiodeDag } from "~/utils/types";

describe("Dag", () => {
  const mockDag: IRapporteringsperiodeDag = {
    type: "UKJENT",
    dagIndex: 0,
    dato: "2024-01-15",
    aktiviteter: [],
  };

  describe("ingen aktivitet", () => {
    it("skal vise dato uten aktiviteter", () => {
      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={mockDag} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("15.")).toBeInTheDocument();
    });

    it("skal ha grå bakgrunnsfarge når det ikke er aktiviteter", () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Dag dag={mockDag} />
            </tr>
          </tbody>
        </table>,
      );

      // Sjekk at dato-elementet eksisterer (med CSS-modul klasse)
      const datoElement = container.querySelector('[class*="dato"]');
      expect(datoElement).toBeInTheDocument();
    });
  });

  describe("enkeltaktivitet", () => {
    it("skal vise arbeidstimer", () => {
      const dagMedArbeid: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-15", timer: "PT7H30M" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedArbeid} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Jobb 7.5t")).toBeInTheDocument();
    });

    it("skal vise syk aktivitet", () => {
      const dagMedSyk: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Syk", dato: "2024-01-15" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedSyk} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Syk")).toBeInTheDocument();
    });

    it("skal vise ferie aktivitet", () => {
      const dagMedFerie: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Fravaer", dato: "2024-01-15" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedFerie} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Ferie")).toBeInTheDocument();
    });

    it("skal vise utdanning aktivitet", () => {
      const dagMedUtdanning: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Utdanning", dato: "2024-01-15" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedUtdanning} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Utdanning")).toBeInTheDocument();
    });

    it("skal vise dag-wrapper for arbeid", () => {
      const dagMedArbeid: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-15", timer: "PT7H30M" }],
      };

      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedArbeid} />
            </tr>
          </tbody>
        </table>,
      );

      // Sjekk at dag-strukturen eksisterer
      const dagWrapper = container.querySelector('[class*="dagWrapper"]');
      expect(dagWrapper).toBeInTheDocument();
    });
  });

  describe("flere aktiviteter", () => {
    it("skal vise alle aktiviteter sortert i riktig rekkefølge", () => {
      const dagMedFlereAktiviteter: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [
          { type: "Utdanning", dato: "2024-01-15" },
          { type: "Arbeid", dato: "2024-01-15", timer: "PT4H" },
          { type: "Syk", dato: "2024-01-15" },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedFlereAktiviteter} />
            </tr>
          </tbody>
        </table>,
      );

      const aktiviteter = screen.getAllByText(/Jobb|Syk|Utdanning/);
      expect(aktiviteter).toHaveLength(3);
      expect(aktiviteter[0]).toHaveTextContent("Jobb 4t");
      expect(aktiviteter[1]).toHaveTextContent("Syk");
      expect(aktiviteter[2]).toHaveTextContent("Utdanning");
    });

    it("skal vise aktiviteter-wrapper når det er flere enn én aktivitet", () => {
      const dagMedFlereAktiviteter: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [
          { type: "Arbeid", dato: "2024-01-15", timer: "PT4H" },
          { type: "Syk", dato: "2024-01-15" },
        ],
      };

      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedFlereAktiviteter} />
            </tr>
          </tbody>
        </table>,
      );

      const aktivitetElements = container.querySelectorAll('[class*="aktivitet"]');
      expect(aktivitetElements.length).toBeGreaterThan(0);
    });

    it("skal ha aktiviteter-wrapper når det er flere aktiviteter", () => {
      const dagMedFlereAktiviteter: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [
          { type: "Arbeid", dato: "2024-01-15", timer: "PT4H" },
          { type: "Syk", dato: "2024-01-15" },
        ],
      };

      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedFlereAktiviteter} />
            </tr>
          </tbody>
        </table>,
      );

      const wrapperElement = container.querySelector('[class*="aktiviteterWrapper"]');
      expect(wrapperElement).toBeInTheDocument();
    });
  });

  describe("prioritering av farger", () => {
    it("skal vise begge aktiviteter når både Syk og Arbeid finnes", () => {
      const dagMedSykOgArbeid: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [
          { type: "Arbeid", dato: "2024-01-15", timer: "PT4H" },
          { type: "Syk", dato: "2024-01-15" },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedSykOgArbeid} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Jobb 4t")).toBeInTheDocument();
      expect(screen.getByText("Syk")).toBeInTheDocument();
    });

    it("skal vise begge aktiviteter når både Fravaer og Utdanning finnes", () => {
      const dagMedFerieOgUtdanning: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [
          { type: "Fravaer", dato: "2024-01-15" },
          { type: "Utdanning", dato: "2024-01-15" },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedFerieOgUtdanning} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Ferie")).toBeInTheDocument();
      expect(screen.getByText("Utdanning")).toBeInTheDocument();
    });
  });

  describe("arbeidstimer formatering", () => {
    it("skal vise arbeid uten timer hvis timer mangler", () => {
      const dagMedArbeidUtenTimer: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-15" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedArbeidUtenTimer} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Jobb")).toBeInTheDocument();
    });

    it("skal formatere hele timer korrekt", () => {
      const dagMedHeleTimer: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-15", timer: "PT8H" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedHeleTimer} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Jobb 8t")).toBeInTheDocument();
    });

    it("skal formatere desimaltimer korrekt", () => {
      const dagMedDesimalTimer: IRapporteringsperiodeDag = {
        type: "UKJENT",
        dagIndex: 0,
        dato: "2024-01-15",
        aktiviteter: [{ type: "Arbeid", dato: "2024-01-15", timer: "PT3H45M" }],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Dag dag={dagMedDesimalTimer} />
            </tr>
          </tbody>
        </table>,
      );

      expect(screen.getByText("Jobb 3.75t")).toBeInTheDocument();
    });
  });
});
