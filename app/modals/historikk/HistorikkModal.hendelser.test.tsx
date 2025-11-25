import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";

import { EVENT_TYPES, HistorikkModal, type IHendelse } from "./HistorikkModal";

// Helper function to render with required providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<SaksbehandlerProvider>{ui}</SaksbehandlerProvider>);
}

describe("HistorikkModal - Hendelsesvisning", () => {
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
      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[baseMockHendelse]} />,
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

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[korrigertHendelse]} />,
      );

      expect(screen.getByText("Korrigert")).toBeInTheDocument();
    });

    it("skal vise 'Innsendt etter fristen' tag for forsinkede meldekort", () => {
      const forsinketHendelse: IHendelse = {
        ...baseMockHendelse,
        erSendtForSent: true,
      };

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[forsinketHendelse]} />,
      );

      expect(screen.getByText("Innsendt etter fristen")).toBeInTheDocument();
      expect(screen.getByText(/Frist:/)).toBeInTheDocument();
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

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[systemHendelse]} />,
      );

      expect(screen.getByText("Annen hendelse")).toBeInTheDocument();
      expect(screen.getByText("15.01.2024, kl. --:--")).toBeInTheDocument();
    });
  });

  describe("Registrert som arbeidssøker", () => {
    it("skal vise registrerings-hendelse", () => {
      const registrertHendelse: IHendelse = {
        dato: new Date("2024-01-15T00:00:00"),
        innsendtDato: "15.01.2024",
        time: "--:--",
        event: EVENT_TYPES.REGISTERED,
        kategori: "System",
      };

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[registrertHendelse]} />,
      );

      expect(screen.getByText(EVENT_TYPES.REGISTERED)).toBeInTheDocument();
      expect(screen.getByText("15.01.2024, kl. --:--")).toBeInTheDocument();
    });
  });

  describe("Avregistrert som arbeidssøker", () => {
    it("skal vise avregistrerings-hendelse", () => {
      const avregistrertHendelse: IHendelse = {
        dato: new Date("2024-03-15T00:00:00"),
        innsendtDato: "15.03.2024",
        time: "--:--",
        event: EVENT_TYPES.UNREGISTERED,
        kategori: "System",
      };

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[avregistrertHendelse]} />,
      );

      expect(screen.getByText(EVENT_TYPES.UNREGISTERED)).toBeInTheDocument();
      expect(screen.getByText("15.03.2024, kl. --:--")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("skal håndtere hendelse uten type", () => {
      const hendelseUtenType: IHendelse = {
        ...baseMockHendelse,
        type: undefined,
      };

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[hendelseUtenType]} />,
      );

      expect(screen.getByText("Meldekort uke 2 og 3, 2024")).toBeInTheDocument();
      expect(screen.queryByText("Elektronisk")).not.toBeInTheDocument();
    });

    it("skal håndtere ulike datoformater", () => {
      const hendelseMedAnnenDato: IHendelse = {
        ...baseMockHendelse,
        dato: new Date("2023-12-31T23:59:59"),
        innsendtDato: "31.12.2023",
      };

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={[hendelseMedAnnenDato]} />,
      );

      expect(screen.getByText(/31.12.2023/)).toBeInTheDocument();
    });

    it("skal håndtere flere hendelser av samme type", () => {
      const hendelser: IHendelse[] = [
        baseMockHendelse,
        {
          ...baseMockHendelse,
          dato: new Date("2024-02-15T10:30:00"),
          innsendtDato: "15.02.2024",
          event: "Meldekort uke 6 og 7, 2024",
        },
      ];

      renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={hendelser} />);

      expect(screen.getByText("Meldekort uke 2 og 3, 2024")).toBeInTheDocument();
      expect(screen.getByText("Meldekort uke 6 og 7, 2024")).toBeInTheDocument();
    });
  });
});
