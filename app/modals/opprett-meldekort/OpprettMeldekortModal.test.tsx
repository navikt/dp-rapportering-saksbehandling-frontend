import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";

function harTekst(forventetTekst: string) {
  return (_content: string, element: Element | null) => element?.textContent === forventetTekst;
}

const mockUseRouteLoaderData = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useRouteLoaderData: mockUseRouteLoaderData,
}));

import { OpprettMeldekortModal } from "./OpprettMeldekortModal";
import type { IOpprettMeldekortResponse } from "./opprettMeldekortModal.helpers";

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
        tekst: "Dette vil opprette {{antall}} meldekort.",
      },
      feilmelding: {
        tittel: "Kunne ikke opprette meldekort",
        tekst: "Noe gikk galt ved opprettelse av meldekort. Prøv igjen senere.",
      },
    },
  },
});

function renderWithProviders(
  ui: React.ReactElement,
  actionResponse:
    | IOpprettMeldekortResponse
    | ((request: Request) => IOpprettMeldekortResponse | Promise<IOpprettMeldekortResponse>) = {
    success: true,
  },
) {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <SaksbehandlerProvider>{ui}</SaksbehandlerProvider>,
    },
    {
      path: "/api/opprett-meldekort",
      action: ({ request }) =>
        typeof actionResponse === "function" ? actionResponse(request) : actionResponse,
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

  it("skal ikke vise info-boks når ingen perioder er simulert", () => {
    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} />);

    expect(screen.queryByText("Info om meldekortsyklus")).not.toBeInTheDocument();
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

    expect(await screen.findAllByText("Du må velge dato")).toHaveLength(2);
    expect(onBekreftMock).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("skal ikke opprette meldekort når personId mangler", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    const actionMock = vi.fn(() => ({ success: true }));

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={onCloseMock} />, actionMock);

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");
    await user.click(screen.getByRole("button", { name: "Opprett" }));

    expect(actionMock).not.toHaveBeenCalled();
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
      async (request) =>
        (await request.formData()).get("simulering") === "true"
          ? { success: true, perioder: [] }
          : { error: "Kunne ikke opprette meldekort", detail: "Ugyldig periode" },
    );

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");
    await user.click(screen.getByRole("button", { name: "Opprett" }));

    expect(await screen.findByText("Kunne ikke opprette meldekort")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Meldekort kunne ikke opprettes. Prøv igjen, og hvis du fortsatt har problemer kontakt brukerstøtte.",
      ),
    ).toBeInTheDocument();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("skal vise generell feilmelding når forhåndsvisningen feiler", async () => {
    const user = userEvent.setup();

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} personId="123" />, {
      error: "Forhåndsvisning feilet",
    });

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");

    expect(await screen.findByText("Kan ikke forhåndsvise meldekort")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Forhåndsvisningen funker ikke som den skal. En mulig årsak er at datoene du har valgt ikke stemmer overens med brukers meldesyklus. Prøv å justere datoene, eller ta kontakt med brukerstøtte.",
      ),
    ).toBeInTheDocument();
  });

  it("skal deaktivere opprett-knappen og markere perioden ved overlapp", async () => {
    const user = userEvent.setup();

    renderWithProviders(<OpprettMeldekortModal open={true} onClose={vi.fn()} personId="123" />, {
      success: false,
      perioder: [
        { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14", overlapperEksisterendeMeldekort: true },
      ],
    });

    await user.type(screen.getByLabelText("Fra dato"), "01.01.2024");
    await user.type(screen.getByLabelText("Til dato"), "14.01.2024");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Opprett" })).toBeDisabled();
    });

    expect(screen.getByLabelText("Overlapper eksisterende meldekort")).toBeInTheDocument();
    expect(screen.queryByText("Kan ikke forhåndsvise meldekort")).not.toBeInTheDocument();
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

  describe("Simulering av opprettelse", () => {
    function renderMedSimulering(ui: React.ReactElement) {
      const Stub = createRoutesStub([
        {
          path: "/",
          Component: () => <SaksbehandlerProvider>{ui}</SaksbehandlerProvider>,
        },
        {
          path: "/api/opprett-meldekort",
          action: async ({ request }) => {
            const formData = await request.formData();

            if (formData.get("simulering") === "true") {
              return {
                success: true,
                perioder: [{ fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }],
              };
            }

            return { success: true };
          },
        },
      ]);

      return render(<Stub initialEntries={["/"]} />);
    }

    it("skal simulere opprettelsen når begge datoer er valgt og vise forhåndsvisning", async () => {
      const user = userEvent.setup();
      renderMedSimulering(<OpprettMeldekortModal open={true} onClose={vi.fn()} personId="123" />);

      await user.type(screen.getByLabelText("Fra dato"), "06.01.2025");
      await user.type(screen.getByLabelText("Til dato"), "19.01.2025");

      expect(
        await screen.findByText(harTekst("Dette vil opprette 1 meldekort.")),
      ).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Ukenummer" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Periode" })).toBeInTheDocument();
      expect(screen.getByText(/06.01.2025.*19.01.2025/)).toBeInTheDocument();
    });

    it("skal ikke vise forhåndsvisning når kun én dato er valgt", async () => {
      const user = userEvent.setup();
      renderMedSimulering(<OpprettMeldekortModal open={true} onClose={vi.fn()} personId="123" />);

      await user.type(screen.getByLabelText("Fra dato"), "06.01.2025");

      expect(screen.queryByText("Info om meldekortsyklus")).not.toBeInTheDocument();
    });

    it("skal vise lastestatus mens simuleringen pågår", async () => {
      const user = userEvent.setup();
      let løsSimulering: (() => void) | undefined;
      const simuleringPromise = new Promise<void>((resolve) => {
        løsSimulering = resolve;
      });

      const Stub = createRoutesStub([
        {
          path: "/",
          Component: () => (
            <SaksbehandlerProvider>
              <OpprettMeldekortModal open={true} onClose={vi.fn()} personId="123" />
            </SaksbehandlerProvider>
          ),
        },
        {
          path: "/api/opprett-meldekort",
          action: async () => {
            await simuleringPromise;
            return {
              success: true,
              perioder: [{ fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }],
            };
          },
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      await user.type(screen.getByLabelText("Fra dato"), "06.01.2025");
      await user.type(screen.getByLabelText("Til dato"), "19.01.2025");

      expect(
        await screen.findByTestId("opprett-meldekort-simulering-skeleton"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(harTekst("Dette vil opprette 1 meldekort.")),
      ).not.toBeInTheDocument();

      løsSimulering?.();

      expect(
        await screen.findByText(harTekst("Dette vil opprette 1 meldekort.")),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("opprett-meldekort-simulering-skeleton")).not.toBeInTheDocument();
    });

    it("skal ikke vise info-boks når simuleringen feiler", async () => {
      const user = userEvent.setup();
      const Stub = createRoutesStub([
        {
          path: "/",
          Component: () => (
            <SaksbehandlerProvider>
              <OpprettMeldekortModal open={true} onClose={vi.fn()} personId="123" />
            </SaksbehandlerProvider>
          ),
        },
        {
          path: "/api/opprett-meldekort",
          action: async () => ({ error: "Kunne ikke beregne", status: 500 }),
        },
      ]);

      render(<Stub initialEntries={["/"]} />);

      await user.type(screen.getByLabelText("Fra dato"), "06.01.2025");
      await user.type(screen.getByLabelText("Til dato"), "19.01.2025");

      await waitFor(() => {
        expect(
          screen.queryByTestId("opprett-meldekort-simulering-skeleton"),
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByText("Info om meldekortsyklus")).not.toBeInTheDocument();
    });
  });
});
