import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";
import type { IPerson } from "~/utils/types";

import Personlinje from "./Personlinje";

vi.mock("~/utils/env.utils", () => ({
  showOpprettMeldekortManuelt: false,
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<SaksbehandlerProvider>{ui}</SaksbehandlerProvider>);
}

const mockPerson: IPerson = {
  ansvarligSystem: "DP",
  fornavn: "Ola",
  mellomnavn: "Mellomnavn",
  etternavn: "Nordmann",
  kjonn: "MANN",
  ident: "12345678901",
  fodselsdato: "1990-01-01",
  statsborgerskap: "NOR",
};

describe("Personlinje", () => {
  it("skal vise brukerens navn", () => {
    renderWithProviders(<Personlinje person={mockPerson} />);

    const nameElements = screen.getAllByText("Ola Mellomnavn Nordmann");
    expect(nameElements.length).toBe(2);
  });

  it("skal vise fødselsnummer", () => {
    renderWithProviders(<Personlinje person={mockPerson} />);

    expect(screen.getByText("12345678901")).toBeInTheDocument();
  });

  it("skal vise kopier-knapp for fødselsnummer", () => {
    renderWithProviders(<Personlinje person={mockPerson} />);

    const copyButton = screen.getByRole("button", { name: /kopier/i });
    expect(copyButton).toBeInTheDocument();
  });

  it("skal åpne historikk modal når historikk-knappen klikkes på desktop", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Personlinje person={mockPerson} />);

    const historikkButtons = screen.getAllByRole("button", { name: "Historikk" });
    expect(historikkButtons.length).toBeGreaterThan(0);

    await user.click(historikkButtons[0]);

    expect(screen.getByRole("dialog", { name: "Historikk" })).toBeInTheDocument();
  });

  it("skal lukke historikk modal når lukk-knappen klikkes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Personlinje person={mockPerson} />);

    const historikkButtons = screen.getAllByRole("button", { name: "Historikk" });
    await user.click(historikkButtons[0]);

    expect(screen.getByRole("dialog", { name: "Historikk" })).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /lukk/i });
    await user.click(closeButton);

    expect(screen.queryByRole("dialog", { name: "Historikk" })).not.toBeInTheDocument();
  });

  describe("Opprett meldekort feature flag", () => {
    it("skal ikke vise opprett meldekort knapp når feature flag er av", async () => {
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: false,
      }));

      const { showOpprettMeldekortManuelt } = await import("~/utils/env.utils");
      expect(showOpprettMeldekortManuelt).toBe(false);

      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithoutFlag = PersonlinjeModule.default;

      renderWithProviders(<PersonlinjeWithoutFlag person={mockPerson} />);

      expect(screen.queryByRole("button", { name: "Opprett meldekort" })).not.toBeInTheDocument();
    });

    it("skal vise opprett meldekort knapp når feature flag er på", async () => {
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: true,
      }));

      const { showOpprettMeldekortManuelt } = await import("~/utils/env.utils");
      expect(showOpprettMeldekortManuelt).toBe(true);

      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithFlag = PersonlinjeModule.default;

      renderWithProviders(<PersonlinjeWithFlag person={mockPerson} />);

      const opprettButtons = screen.queryAllByRole("button", { name: "Opprett meldekort" });
      expect(opprettButtons.length).toBeGreaterThan(0);
    });

    it("skal åpne opprett meldekort modal når knappen klikkes", async () => {
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: true,
      }));

      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithFlag = PersonlinjeModule.default;

      const user = userEvent.setup();
      renderWithProviders(<PersonlinjeWithFlag person={mockPerson} />);

      const opprettButtons = screen.getAllByRole("button", { name: "Opprett meldekort" });
      await user.click(opprettButtons[0]);

      const dialog = screen.getByRole("dialog", { name: "Opprett meldekort" });
      expect(dialog).toBeInTheDocument();
    });

    it("skal lukke opprett meldekort modal når avbryt klikkes", async () => {
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: true,
      }));

      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithFlag = PersonlinjeModule.default;

      const user = userEvent.setup();
      renderWithProviders(<PersonlinjeWithFlag person={mockPerson} />);

      const opprettButtons = screen.getAllByRole("button", { name: "Opprett meldekort" });
      await user.click(opprettButtons[0]);

      expect(screen.getByRole("dialog", { name: "Opprett meldekort" })).toBeInTheDocument();

      const avbrytButton = screen.getByRole("button", { name: "Avbryt" });
      await user.click(avbrytButton);

      expect(screen.queryByRole("dialog", { name: "Opprett meldekort" })).not.toBeInTheDocument();
    });
  });

  describe("Accordion behavior på mobil", () => {
    it("skal toggle detaljer når navn-knappen klikkes på mobil", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Personlinje person={mockPerson} />);

      const nameButtons = screen.getAllByRole("button", {
        name: /ola mellomnavn nordmann/i,
      });

      expect(nameButtons.length).toBeGreaterThan(0);

      await user.click(nameButtons[0]);

      expect(nameButtons[0]).toHaveAttribute("aria-expanded", "true");

      await user.click(nameButtons[0]);

      expect(nameButtons[0]).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Responsiv design", () => {
    it("skal ha både mobil og desktop navn-containere", () => {
      const { container } = renderWithProviders(<Personlinje person={mockPerson} />);

      const mobilContainer = container.querySelector('[class*="navnContainerMobil"]');
      expect(mobilContainer).toBeInTheDocument();

      const desktopContainer = container.querySelector('[class*="navnContainerDesktop"]');
      expect(desktopContainer).toBeInTheDocument();
    });

    it("skal ha både mobil og desktop knapp-containere", () => {
      const { container } = renderWithProviders(<Personlinje person={mockPerson} />);

      const mobilKnapper = container.querySelector('[class*="knappContainerMobil"]');
      expect(mobilKnapper).toBeInTheDocument();

      const desktopKnapper = container.querySelector('[class*="knappContainerDesktop"]');
      expect(desktopKnapper).toBeInTheDocument();
    });
  });

  describe("Maskerte data", () => {
    it("skal ikke vise kopier-knapp for maskerte data", () => {
      const maskedPerson: IPerson = {
        ...mockPerson,
        fornavn: "•••••",
        etternavn: "•••••",
        ident: "•••••••••••",
      };

      renderWithProviders(<Personlinje person={maskedPerson} />);

      expect(screen.queryByRole("button", { name: /kopier/i })).not.toBeInTheDocument();
    });

    it("skal vise sensitiv styling for maskerte data", () => {
      const maskedPerson: IPerson = {
        ...mockPerson,
        fornavn: "•••••",
        etternavn: "•••••",
      };

      const { container } = renderWithProviders(<Personlinje person={maskedPerson} />);

      const sensitivElements = container.querySelectorAll('[class*="sensitiv"]');
      expect(sensitivElements.length).toBeGreaterThan(0);
    });
  });
});
