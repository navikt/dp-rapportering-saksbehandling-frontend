import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { IHendelse } from "../HistorikkModal";
import { EVENT_TYPES, HistorikkListeItem } from "./HistorikkListeItem";

describe("HistorikkListeItem", () => {
  const baseMockHendelse: IHendelse = {
    dato: new Date("2024-01-15T10:30:00"),
    innsendtDato: "15.01.2024",
    time: "10:30",
    event: "Meldekort uke 2 og 3, 2024",
    kategori: "Meldekort",
    type: "Elektronisk",
  };

  describe("Meldekort-hendelser", () => {
    it("skal vise meldekort-hendelse med korrekt informasjon", () => {
      render(
        <ul>
          <HistorikkListeItem hendelse={baseMockHendelse} />
        </ul>,
      );

      expect(screen.getByText("Meldekort uke 2 og 3, 2024")).toBeInTheDocument();
      expect(screen.getByText("Innsendt: 15.01.2024, kl. 10:30")).toBeInTheDocument();
      expect(screen.getByText("Elektronisk")).toBeInTheDocument();
    });

    it("skal vise 'Korrigert' tag for korrigerte meldekort", () => {
      const korrigertHendelse: IHendelse = {
        ...baseMockHendelse,
        hendelseType: "Korrigert",
      };

      render(
        <ul>
          <HistorikkListeItem hendelse={korrigertHendelse} />
        </ul>,
      );

      expect(screen.getByText("Korrigert")).toBeInTheDocument();
    });

    it("skal vise 'Innsendt etter fristen' tag for forsinkede meldekort", () => {
      const forsinketHendelse: IHendelse = {
        ...baseMockHendelse,
        erSendtForSent: true,
      };

      render(
        <ul>
          <HistorikkListeItem hendelse={forsinketHendelse} />
        </ul>,
      );

      expect(screen.getByText("Innsendt etter fristen")).toBeInTheDocument();
      expect(screen.getByText(/Frist:/)).toBeInTheDocument();
    });

    it("skal vise standard grå bullet for meldekort", () => {
      const { container } = render(
        <ul>
          <HistorikkListeItem hendelse={baseMockHendelse} />
        </ul>,
      );

      const circle = container.querySelector("circle");
      expect(circle).toBeInTheDocument();
      expect(circle?.getAttribute("fill")).toBe("#D9D9D9");
    });
  });

  describe("System-hendelser", () => {
    it("skal vise system-hendelse uten type", () => {
      const systemHendelse: IHendelse = {
        dato: new Date("2024-01-15T00:00:00"),
        innsendtDato: "15.01.2024",
        time: "--:--",
        event: "Annen hendelse",
        kategori: "System",
      };

      render(
        <ul>
          <HistorikkListeItem hendelse={systemHendelse} />
        </ul>,
      );

      expect(screen.getByText("Annen hendelse")).toBeInTheDocument();
      expect(screen.getByText("15.01.2024, kl. --:--")).toBeInTheDocument();
    });
  });

  describe("Registrert som arbeidssøker", () => {
    const registrertHendelse: IHendelse = {
      dato: new Date("2024-01-15T00:00:00"),
      innsendtDato: "15.01.2024",
      time: "--:--",
      event: EVENT_TYPES.REGISTERED,
      kategori: "System",
    };

    it("skal vise registrerings-hendelse", () => {
      render(
        <ul>
          <HistorikkListeItem hendelse={registrertHendelse} />
        </ul>,
      );

      expect(screen.getByText(EVENT_TYPES.REGISTERED)).toBeInTheDocument();
    });

    it("skal vise grønn badge med checkmark for registrering", () => {
      const { container } = render(
        <ul>
          <HistorikkListeItem hendelse={registrertHendelse} />
        </ul>,
      );

      // Sjekk for badge container
      const bulletContainer = container.querySelector('[class*="bulletContainer"]');
      expect(bulletContainer).toBeInTheDocument();
      expect(bulletContainer).toHaveStyle({ backgroundColor: "#CCF1D6" });

      // Sjekk for SVG (checkmark icon fra Aksel)
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Avregistrert som arbeidssøker", () => {
    const avregistrertHendelse: IHendelse = {
      dato: new Date("2024-03-15T00:00:00"),
      innsendtDato: "15.03.2024",
      time: "--:--",
      event: EVENT_TYPES.UNREGISTERED,
      kategori: "System",
    };

    it("skal vise avregistrerings-hendelse", () => {
      render(
        <ul>
          <HistorikkListeItem hendelse={avregistrertHendelse} />
        </ul>,
      );

      expect(screen.getByText(EVENT_TYPES.UNREGISTERED)).toBeInTheDocument();
    });

    it("skal vise rød badge med X for avregistrering", () => {
      const { container } = render(
        <ul>
          <HistorikkListeItem hendelse={avregistrertHendelse} />
        </ul>,
      );

      // Sjekk for badge container
      const bulletContainer = container.querySelector('[class*="bulletContainer"]');
      expect(bulletContainer).toBeInTheDocument();
      expect(bulletContainer).toHaveStyle({ backgroundColor: "#FFC2C2" });

      // Sjekk for SVG (X icon fra Aksel)
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("CSS klasser", () => {
    it("skal ha markerContainerEmpty klasse for vanlige hendelser", () => {
      const { container } = render(
        <ul>
          <HistorikkListeItem hendelse={baseMockHendelse} />
        </ul>,
      );

      const markerContainer = container.querySelector('[class*="markerContainerEmpty"]');
      expect(markerContainer).toBeInTheDocument();
    });

    it("skal ikke ha markerContainerEmpty klasse for registrering", () => {
      const registrertHendelse: IHendelse = {
        ...baseMockHendelse,
        event: EVENT_TYPES.REGISTERED,
        kategori: "System",
      };

      const { container } = render(
        <ul>
          <HistorikkListeItem hendelse={registrertHendelse} />
        </ul>,
      );

      const markerContainer = container.querySelector('[class*="markerContainerEmpty"]');
      expect(markerContainer).not.toBeInTheDocument();
    });

    it("skal ha line element", () => {
      const { container } = render(
        <ul>
          <HistorikkListeItem hendelse={baseMockHendelse} />
        </ul>,
      );

      const line = container.querySelector('[class*="line"]');
      expect(line).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("skal håndtere hendelse uten type", () => {
      const hendelseUtenType: IHendelse = {
        ...baseMockHendelse,
        type: undefined,
      };

      render(
        <ul>
          <HistorikkListeItem hendelse={hendelseUtenType} />
        </ul>,
      );

      expect(screen.getByText("Meldekort uke 2 og 3, 2024")).toBeInTheDocument();
    });

    it("skal håndtere ulike datoformater", () => {
      const hendelseMedAnnenDato: IHendelse = {
        ...baseMockHendelse,
        dato: new Date("2023-12-31T23:59:59"),
        innsendtDato: "31.12.2023",
      };

      render(
        <ul>
          <HistorikkListeItem hendelse={hendelseMedAnnenDato} />
        </ul>,
      );

      expect(screen.getByText(/31.12.2023/)).toBeInTheDocument();
    });
  });
});
