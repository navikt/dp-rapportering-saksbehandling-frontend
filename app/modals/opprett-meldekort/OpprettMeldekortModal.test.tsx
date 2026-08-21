import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";

import { OpprettMeldekortModal } from "./OpprettMeldekortModal";
import type { IOpprettMeldekortResponse } from "./opprettMeldekortModal.helpers";

const sanityTekster = {
  tittel: "Opprett meldekort",
  fraDato: {
    label: "Fra dato",
    helpText: "Velg startdato for perioden du vil opprette meldekort for",
  },
  tilDato: {
    label: "Til dato",
    helpText: "Velg sluttdato for perioden du vil opprette meldekort for",
  },
  forklaringstekst: "Velg periode for meldekortet",
  submitKnapp: "Opprett",
  avbrytKnapp: "Avbryt",
  infoBoks: {
    tittel: "Info om meldekortsyklus",
    tekst:
      "Nye meldekort opprettes i samme syklus som den bruker allerede har. Meldekort opprettes hver 14. dag.",
  },
  feilmelding: {
    tittel: "Feil",
    tekst: "Noe gikk galt",
  },
};

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useRouteLoaderData: () => ({ sanityData: { opprettMeldekortModal: sanityTekster } }),
  };
});

function renderWithProviders(
  ui: React.ReactElement,
  actionResponse: IOpprettMeldekortResponse = { success: true },
) {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <SaksbehandlerProvider>{ui}</SaksbehandlerProvider>,
    },
    {
      path: "/api/opprett-meldekort",
      action: () => actionResponse,
    },
  ]);

  return render(<Stub initialEntries={["/"]} />);
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

  it("skal vise valideringsfeil når dato ikke er valgt", async () => {
    const user = userEvent.setup();
    const onBekreftMock = vi.fn();
    const onCloseMock = vi.fn();

    renderWithProviders(
      <OpprettMeldekortModal
        open={true}
        onClose={onCloseMock}
        onBekreft={onBekreftMock}
        personId="123"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Opprett" }));

    expect(await screen.findByText("Velg fra- og til-dato.")).toBeInTheDocument();
    expect(onBekreftMock).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("skal vise valideringsfeil når personId mangler", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={onCloseMock} />);

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");
    await user.click(screen.getByRole("button", { name: "Opprett" }));

    expect(await screen.findByText("Mangler personId.")).toBeInTheDocument();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("skal kalle onBekreft og onClose når opprettelsen lykkes", async () => {
    const user = userEvent.setup();
    const onBekreftMock = vi.fn();
    const onCloseMock = vi.fn();

    renderWithProviders(
      <OpprettMeldekortModal
        open={true}
        onClose={onCloseMock}
        onBekreft={onBekreftMock}
        personId="123"
      />,
    );

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");
    await user.click(screen.getByRole("button", { name: "Opprett" }));

    await waitFor(
      () => {
        expect(onBekreftMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 5000 },
    );
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("skal vise feilmelding når opprettelsen feiler", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithProviders(
      <OpprettMeldekortModal open={true} onClose={onCloseMock} personId="123" />,
      {
        error: "Kunne ikke opprette meldekort",
        detail: "Ugyldig periode",
      },
    );

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");
    await user.click(screen.getByRole("button", { name: "Opprett" }));

    expect(
      await screen.findByText("Kunne ikke opprette meldekort: Ugyldig periode", undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument();
    expect(onCloseMock).not.toHaveBeenCalled();
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
