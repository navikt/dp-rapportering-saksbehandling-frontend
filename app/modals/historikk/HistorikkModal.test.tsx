import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";

import { HistorikkModal, type IHendelse } from "./HistorikkModal";

// Helper function to render with required providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<SaksbehandlerProvider>{ui}</SaksbehandlerProvider>);
}

describe("HistorikkModal", () => {
  const mockHendelser: IHendelse[] = [
    {
      dato: new Date("2024-01-15T10:30:00"),
      innsendtDato: "15.01.2024",
      time: "10:30",
      event: "Meldekort uke 2 og 3, 2024",
      kategori: "Meldekort",
      type: "Elektronisk",
    },
    {
      dato: new Date("2024-06-20T14:00:00"),
      innsendtDato: "20.06.2024",
      time: "14:00",
      event: "Meldekort uke 24 og 25, 2024",
      kategori: "Meldekort",
      type: "Elektronisk",
    },
    {
      dato: new Date("2023-03-10T00:00:00"),
      innsendtDato: "10.03.2023",
      time: "--:--",
      event: "Registrert som arbeidssøker",
      kategori: "System",
    },
    {
      dato: new Date("2023-12-01T08:00:00"),
      innsendtDato: "01.12.2023",
      time: "08:00",
      event: "Meldekort uke 48 og 49, 2023",
      kategori: "Meldekort",
      type: "Elektronisk",
    },
  ];

  it("skal rendre modal når open er true", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    expect(screen.getByRole("dialog", { name: "Historikk" })).toBeInTheDocument();
    expect(screen.getByText("Historikk")).toBeInTheDocument();
  });

  it("skal ikke rendre modal når open er false", () => {
    renderWithProviders(
      <HistorikkModal open={false} onClose={vi.fn()} hendelser={mockHendelser} />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("skal kalle onClose når modal lukkes", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithProviders(
      <HistorikkModal open={true} onClose={onCloseMock} hendelser={mockHendelser} />,
    );

    const closeButton = screen.getByRole("button", { name: /lukk/i });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("skal gruppere hendelser etter år", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("skal vise år i synkende rekkefølge", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    const yearLabels = screen.getAllByText(/^\d{4}$/);
    expect(yearLabels).toHaveLength(2);
    expect(yearLabels[0]).toHaveTextContent("2024");
    expect(yearLabels[1]).toHaveTextContent("2023");
  });

  it("skal vise alle hendelser for 2024", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    expect(screen.getByText("Meldekort uke 2 og 3, 2024")).toBeInTheDocument();
    expect(screen.getByText("Meldekort uke 24 og 25, 2024")).toBeInTheDocument();
  });

  it("skal vise alle hendelser for 2023", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    expect(screen.getByText("Registrert som arbeidssøker")).toBeInTheDocument();
    expect(screen.getByText("Meldekort uke 48 og 49, 2023")).toBeInTheDocument();
  });

  it("skal håndtere tom hendelsesliste", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={[]} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
  });

  it("skal vise hendelser i korrekt rekkefølge innenfor samme år", () => {
    const hendelser2024: IHendelse[] = [
      {
        dato: new Date("2024-12-01T00:00:00"),
        innsendtDato: "01.12.2024",
        time: "12:00",
        event: "Hendelse 3",
        kategori: "System",
      },
      {
        dato: new Date("2024-01-01T00:00:00"),
        innsendtDato: "01.01.2024",
        time: "10:00",
        event: "Hendelse 1",
        kategori: "System",
      },
      {
        dato: new Date("2024-06-15T00:00:00"),
        innsendtDato: "15.06.2024",
        time: "11:00",
        event: "Hendelse 2",
        kategori: "System",
      },
    ];

    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={hendelser2024} />);

    const listItems = screen.getAllByRole("listitem");

    // Hendelsene skal vises i den rekkefølgen de kommer i arrayet
    // (sortering skjer før de sendes til modal)
    expect(within(listItems[0]).getByText("Hendelse 3")).toBeInTheDocument();
    expect(within(listItems[1]).getByText("Hendelse 1")).toBeInTheDocument();
    expect(within(listItems[2]).getByText("Hendelse 2")).toBeInTheDocument();
  });

  it("skal håndtere hendelser med ulike kategorier", () => {
    const blandedHendelser: IHendelse[] = [
      {
        dato: new Date("2024-01-15T00:00:00"),
        innsendtDato: "15.01.2024",
        time: "10:00",
        event: "Meldekort uke 2 og 3, 2024",
        kategori: "Meldekort",
        type: "Elektronisk",
      },
      {
        dato: new Date("2024-01-10T00:00:00"),
        innsendtDato: "10.01.2024",
        time: "--:--",
        event: "Registrert som arbeidssøker",
        kategori: "System",
      },
      {
        dato: new Date("2024-03-15T00:00:00"),
        innsendtDato: "15.03.2024",
        time: "--:--",
        event: "Avregistrert som arbeidssøker",
        kategori: "System",
      },
    ];

    renderWithProviders(
      <HistorikkModal open={true} onClose={vi.fn()} hendelser={blandedHendelser} />,
    );

    expect(screen.getByText("Meldekort uke 2 og 3, 2024")).toBeInTheDocument();
    expect(screen.getByText("Registrert som arbeidssøker")).toBeInTheDocument();
    expect(screen.getByText("Avregistrert som arbeidssøker")).toBeInTheDocument();
  });

  it("skal rendre år-liste med ordered list element", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    const orderedLists = screen.getAllByRole("list");
    expect(orderedLists.length).toBeGreaterThan(0);
  });

  it("skal ha korrekt aria-labelledby på modal", () => {
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "historikk-heading");
  });

  it("skal ha aria-label på Process komponent med riktig årstall", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />);

    // Første accordion er defaultOpen, så 2024 Process er synlig
    const lists = screen.getAllByRole("list");
    const processLists = lists.filter((list) => list.hasAttribute("aria-label"));

    expect(processLists.length).toBeGreaterThan(0);
    expect(processLists[0]).toHaveAttribute("aria-label", "Meldekort for 2024");

    // Åpne 2023 accordion for å se den Process-komponenten
    const accordion2023 = screen.getByRole("button", { name: "2023" });
    await user.click(accordion2023);

    // Nå skal vi finne begge Process-komponentene
    const allLists = screen.getAllByRole("list");
    const allProcessLists = allLists.filter((list) => list.hasAttribute("aria-label"));

    expect(allProcessLists.length).toBe(2);
    expect(allProcessLists[0]).toHaveAttribute("aria-label", "Meldekort for 2024");
    expect(allProcessLists[1]).toHaveAttribute("aria-label", "Meldekort for 2023");
  });

  it("skal håndtere hendelser som kun er i ett år", () => {
    const enkelÅrHendelser: IHendelse[] = [
      {
        dato: new Date("2024-01-01T00:00:00"),
        innsendtDato: "01.01.2024",
        time: "10:00",
        event: "Hendelse 1",
        kategori: "System",
      },
      {
        dato: new Date("2024-12-31T00:00:00"),
        innsendtDato: "31.12.2024",
        time: "23:59",
        event: "Hendelse 2",
        kategori: "System",
      },
    ];

    renderWithProviders(
      <HistorikkModal open={true} onClose={vi.fn()} hendelser={enkelÅrHendelser} />,
    );

    const yearLabels = screen.getAllByText(/^\d{4}$/);
    expect(yearLabels).toHaveLength(1);
    expect(yearLabels[0]).toHaveTextContent("2024");
  });

  it("skal håndtere mange år med hendelser", () => {
    const flerårigHendelser: IHendelse[] = [
      {
        dato: new Date("2024-01-01T00:00:00"),
        innsendtDato: "01.01.2024",
        time: "10:00",
        event: "Hendelse 2024",
        kategori: "System",
      },
      {
        dato: new Date("2023-01-01T00:00:00"),
        innsendtDato: "01.01.2023",
        time: "10:00",
        event: "Hendelse 2023",
        kategori: "System",
      },
      {
        dato: new Date("2022-01-01T00:00:00"),
        innsendtDato: "01.01.2022",
        time: "10:00",
        event: "Hendelse 2022",
        kategori: "System",
      },
      {
        dato: new Date("2021-01-01T00:00:00"),
        innsendtDato: "01.01.2021",
        time: "10:00",
        event: "Hendelse 2021",
        kategori: "System",
      },
    ];

    renderWithProviders(
      <HistorikkModal open={true} onClose={vi.fn()} hendelser={flerårigHendelser} />,
    );

    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();

    const yearLabels = screen.getAllByText(/^\d{4}$/);
    expect(yearLabels).toHaveLength(4);
  });

  describe("Alertmeldinger", () => {
    it("skal vise alertmelding når det ikke finnes meldekort", () => {
      const hendelserUtenMeldekort: IHendelse[] = [
        {
          dato: new Date("2024-01-10T00:00:00"),
          innsendtDato: "10.01.2024",
          time: "--:--",
          event: "Registrert som arbeidssøker",
          kategori: "System",
        },
      ];

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={hendelserUtenMeldekort} />,
      );

      expect(
        screen.getByText("Fant ingen meldekort knyttet til denne personen"),
      ).toBeInTheDocument();
    });

    it("skal vise alertmelding når det ikke finnes arbeidssøkerstatus", () => {
      const hendelserUtenArbeidssoker: IHendelse[] = [
        {
          dato: new Date("2024-01-15T10:30:00"),
          innsendtDato: "15.01.2024",
          time: "10:30",
          event: "Meldekort uke 2 og 3, 2024",
          kategori: "Meldekort",
          type: "Elektronisk",
        },
      ];

      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={hendelserUtenArbeidssoker} />,
      );

      expect(
        screen.getByText("Fant ingen arbeidssøkerstatus knyttet til denne personen"),
      ).toBeInTheDocument();
    });

    it("skal vise kombinert alertmelding når det ikke finnes verken meldekort eller arbeidssøkerstatus", () => {
      renderWithProviders(<HistorikkModal open={true} onClose={vi.fn()} hendelser={[]} />);

      expect(
        screen.getByText(
          "Fant hverken meldekort eller arbeidssøkerstatus knyttet til denne personen",
        ),
      ).toBeInTheDocument();
    });

    it("skal ikke vise alertmelding når det finnes både meldekort og arbeidssøkerstatus", () => {
      renderWithProviders(
        <HistorikkModal open={true} onClose={vi.fn()} hendelser={mockHendelser} />,
      );

      expect(
        screen.queryByText("Fant ingen meldekort knyttet til denne personen"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Fant ingen arbeidssøkerstatus knyttet til denne personen"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Fant hverken meldekort eller arbeidssøkerstatus knyttet til denne personen",
        ),
      ).not.toBeInTheDocument();
    });
  });
});
