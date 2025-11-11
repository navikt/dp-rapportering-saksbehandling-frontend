import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ANSVARLIG_SYSTEM,
  MELDEKORT_TYPE,
  OPPRETTET_AV,
  RAPPORTERINGSPERIODE_STATUS,
} from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { MeldekortVisning } from "./MeldekortVisning";

describe("MeldekortVisning", () => {
  const basePeriode: IRapporteringsperiode = {
    id: "test-1",
    ident: "12345678901",
    type: MELDEKORT_TYPE.ORDINAERT,
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [],
    kanSendes: false,
    kanEndres: false,
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

  describe("Rendering av tomt meldekort (TilUtfylling)", () => {
    it("skal vise melding om at meldekortet ikke er fylt ut", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByText("Dette meldekortet er ikke fylt ut enda.")).toBeInTheDocument();
    });

    it("skal vise 'Fyll ut meldekort' knapp når kanSendes er true og ansvarlig system er DP", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
          kanSendes: true,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const knapp = screen.getByRole("button", { name: /fyll ut meldekort/i });
      expect(knapp).toBeInTheDocument();
      expect(knapp).toHaveAttribute("href", "/person/123/periode/test-1/fyll-ut");
    });

    it("skal ikke vise 'Fyll ut meldekort' knapp når kanSendes er false", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
          kanSendes: false,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.queryByRole("button", { name: /fyll ut meldekort/i })).not.toBeInTheDocument();
    });

    it("skal ikke vise 'Fyll ut meldekort' knapp når ansvarlig system er ARENA", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
          kanSendes: true,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.ARENA}
        />,
      );

      expect(screen.queryByRole("button", { name: /fyll ut meldekort/i })).not.toBeInTheDocument();
    });

    it("skal ha root--tomt klasse når periode er TilUtfylling", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        },
      ];

      const { container } = render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const section = container.querySelector("section");
      expect(section?.className).toContain("root--tomt");
    });
  });

  describe("Rendering av innsendt meldekort", () => {
    it("skal vise uke og dato når meldekort er innsendt", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
          periode: {
            fraOgMed: "2024-01-01",
            tilOgMed: "2024-01-14",
          },
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.getByRole("heading", { name: /uke 1 - 2/i })).toBeInTheDocument();
    });

    it("skal ikke vise melding om tomt meldekort når status er Innsendt", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      expect(screen.queryByText("Dette meldekortet er ikke fylt ut enda.")).not.toBeInTheDocument();
    });

    it("skal ikke ha root--tomt klasse når periode er Innsendt", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        },
      ];

      const { container } = render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const section = container.querySelector("section");
      expect(section?.className).not.toContain("root--tomt");
    });

    it("skal ha korrekt aria-labelledby på section", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "periode-123",
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-labelledby", "periode-periode-123");
    });
  });

  describe("Rendering av flere perioder", () => {
    it("skal rendre flere perioder", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "periode-1",
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
          periode: {
            fraOgMed: "2024-01-01",
            tilOgMed: "2024-01-14",
          },
        },
        {
          ...basePeriode,
          id: "periode-2",
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
          periode: {
            fraOgMed: "2024-01-15",
            tilOgMed: "2024-01-28",
          },
        },
        {
          ...basePeriode,
          id: "periode-3",
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
          periode: {
            fraOgMed: "2024-01-29",
            tilOgMed: "2024-02-11",
          },
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const sections = screen.getAllByRole("region");
      expect(sections).toHaveLength(3);
    });

    it("skal vise blanding av tomme og innsendte meldekort", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "periode-1",
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        },
        {
          ...basePeriode,
          id: "periode-2",
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
          kanSendes: true,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      // Skal finne ett innsendt meldekort med uke-heading
      expect(screen.getByRole("heading", { name: /uke 1 - 2/i })).toBeInTheDocument();

      // Skal finne ett tomt meldekort med melding
      expect(screen.getByText("Dette meldekortet er ikke fylt ut enda.")).toBeInTheDocument();

      // Skal finne 'Fyll ut meldekort' knapp
      expect(screen.getByRole("button", { name: /fyll ut meldekort/i })).toBeInTheDocument();
    });
  });

  describe("Rendering uten personId", () => {
    it("skal rendre uten personId i URL når personId ikke er oppgitt", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
          kanSendes: true,
        },
      ];

      render(
        <MeldekortVisning
          perioder={perioder}
          personId={undefined}
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const knapp = screen.getByRole("button", { name: /fyll ut meldekort/i });
      expect(knapp).toHaveAttribute("href", "/person/undefined/periode/test-1/fyll-ut");
    });
  });

  describe("Time elements", () => {
    it("skal ha korrekt datetime attributt på time elements", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
          periode: {
            fraOgMed: "2024-01-01",
            tilOgMed: "2024-01-14",
          },
        },
      ];

      const { container } = render(
        <MeldekortVisning
          perioder={perioder}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
        />,
      );

      const timeElements = container.querySelectorAll("time");
      expect(timeElements).toHaveLength(2);
      expect(timeElements[0]).toHaveAttribute("dateTime", "2024-01-01");
      expect(timeElements[1]).toHaveAttribute("dateTime", "2024-01-14");
    });
  });
});
