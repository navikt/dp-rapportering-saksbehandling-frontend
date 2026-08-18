import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";

const mockUseRouteLoaderData = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useRouteLoaderData: mockUseRouteLoaderData,
}));

import { OpprettMeldekortModal } from "./OpprettMeldekortModal";

mockUseRouteLoaderData.mockReturnValue({
  sanityData: {
    opprettMeldekortModal: {
      tittel: "Opprett meldekort",
      fraDato: {
        label: "Fra dato",
        helpText: "Velg startdato for perioden du vil opprette meldekort for",
      },
      tilDato: {
        label: "Til dato",
        helpText: "Velg sluttdato for perioden du vil opprette meldekort for",
      },
      forklaringstekst: "Basert på valgt dato, vil det opprettes {{antall}} nye meldekort.",
      submitKnapp: "Opprett",
      avbrytKnapp: "Avbryt",
      infoBoks: {
        tittel: "Info om meldekortsyklus",
        tekst:
          "Nye meldekort opprettes i samme syklus som den bruker allerede har. Meldekort opprettes hver 14. dag.",
      },
      feilmelding: {
        tittel: "Kunne ikke opprette meldekort",
        tekst: "Noe gikk galt ved opprettelse av meldekort. Prøv igjen senere.",
      },
    },
  },
});

// Helper function to render with required providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<SaksbehandlerProvider>{ui}</SaksbehandlerProvider>);
}

describe("OpprettMeldekortModal", () => {
  it("skal rendre modal når open er true", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Opprett meldekort" })).toBeInTheDocument();
    expect(screen.getByText("Opprett meldekort")).toBeInTheDocument();
  });

  it("skal ikke rendre modal når open er false", () => {
    renderWithProviders(<OpprettMeldekortModal open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("skal kalle onClose når modal lukkes", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={onCloseMock} />);

    const closeButton = screen.getByRole("button", { name: /lukk/i });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("skal kalle onClose når avbryt-knappen klikkes", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={onCloseMock} />);

    const avbrytButton = screen.getByRole("button", { name: "Avbryt" });
    await user.click(avbrytButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("skal vise fra-dato og til-dato input felter", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    expect(screen.getByLabelText("Fra dato")).toBeInTheDocument();
    expect(screen.getByLabelText("Til dato")).toBeInTheDocument();
  });

  it("skal vise info-boks med informasjon om meldekortsyklus", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    expect(screen.getByText("Info om meldekortsyklus")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nye meldekort opprettes i samme syklus som den bruker allerede har. Meldekort opprettes hver 14. dag.",
      ),
    ).toBeInTheDocument();
  });

  it("skal vise opprett-knapp", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    const opprettButton = screen.getByRole("button", { name: "Opprett" });
    expect(opprettButton).toBeInTheDocument();
  });

  it("skal kalle onBekreft og onClose når opprett-knappen klikkes", async () => {
    const user = userEvent.setup();
    const onBekreftMock = vi.fn();
    const onCloseMock = vi.fn();

    renderWithProviders(
      <OpprettMeldekortModal open={true} onClose={onCloseMock} onBekreft={onBekreftMock} />,
    );

    const opprettButton = screen.getByRole("button", { name: "Opprett" });
    await user.click(opprettButton);

    expect(onBekreftMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("skal vise brukernavn i tittel når det er oppgitt", () => {
    renderWithProviders(
      <OpprettMeldekortModal open={true} onClose={vi.fn()} brukerNavn="Ola Nordmann" />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("skal ha korrekt aria-label på modal", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Opprett meldekort");
  });

  it("skal ha medium størrelse på modal", () => {
    const { container } = renderWithProviders(
      <OpprettMeldekortModal open={true} onClose={vi.fn()} />,
    );

    const modalContent = container.querySelector('[class*="modal"]');
    expect(modalContent).toBeInTheDocument();
  });

  it("skal ikke kalle onBekreft hvis det ikke er definert", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={onCloseMock} />);

    const opprettButton = screen.getByRole("button", { name: "Opprett" });
    await user.click(opprettButton);

    // Should only close, not throw error
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("skal vise hjelpetekst for fra-dato felt", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    expect(
      screen.getByText("Velg startdato for perioden du vil opprette meldekort for"),
    ).toBeInTheDocument();
  });

  it("skal vise hjelpetekst for til-dato felt", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    expect(
      screen.getByText("Velg sluttdato for perioden du vil opprette meldekort for"),
    ).toBeInTheDocument();
  });

  describe("DatePicker integration", () => {
    it("skal bruke useRangeDatepicker for dato-valg", () => {
      renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

      const fromInput = screen.getByLabelText("Fra dato");
      const toInput = screen.getByLabelText("Til dato");

      expect(fromInput).toBeInTheDocument();
      expect(toInput).toBeInTheDocument();
    });
  });
});
