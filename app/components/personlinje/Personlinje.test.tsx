import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";
import type { IPerson } from "~/utils/types";

import Personlinje from "./Personlinje";

// Mock the environment utils to control feature flag
vi.mock("~/utils/env.utils", () => ({
  showOpprettMeldekortManuelt: false,
}));

// Helper function to render with required providers
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

    // Should appear in both mobile and desktop containers
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
    // Desktop button should exist
    expect(historikkButtons.length).toBeGreaterThan(0);

    // Click the first historikk button (could be mobile or desktop depending on viewport)
    await user.click(historikkButtons[0]);

    // Modal should open
    expect(screen.getByRole("dialog", { name: "Historikk" })).toBeInTheDocument();
  });

  it("skal lukke historikk modal når lukk-knappen klikkes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Personlinje person={mockPerson} />);

    const historikkButtons = screen.getAllByRole("button", { name: "Historikk" });
    await user.click(historikkButtons[0]);

    // Modal should be open
    expect(screen.getByRole("dialog", { name: "Historikk" })).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByRole("button", { name: /lukk/i });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByRole("dialog", { name: "Historikk" })).not.toBeInTheDocument();
  });

  describe("Opprett meldekort feature flag", () => {
    it("skal ikke vise opprett meldekort knapp når feature flag er av", () => {
      renderWithProviders(<Personlinje person={mockPerson} />);

      expect(screen.queryByRole("button", { name: "Opprett meldekort" })).not.toBeInTheDocument();
    });

    it("skal vise opprett meldekort knapp når feature flag er på", async () => {
      // Re-mock with feature flag enabled
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: true,
      }));

      const { showOpprettMeldekortManuelt } = await import("~/utils/env.utils");

      // Verify mock is working
      expect(showOpprettMeldekortManuelt).toBe(true);

      // Re-import component after mock
      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithFlag = PersonlinjeModule.default;

      renderWithProviders(<PersonlinjeWithFlag person={mockPerson} />);

      const opprettButtons = screen.queryAllByRole("button", { name: "Opprett meldekort" });
      expect(opprettButtons.length).toBeGreaterThan(0);
    });

    it("skal åpne opprett meldekort modal når knappen klikkes", async () => {
      // Re-mock with feature flag enabled
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: true,
      }));

      // Re-import component after mock
      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithFlag = PersonlinjeModule.default;

      const user = userEvent.setup();
      renderWithProviders(<PersonlinjeWithFlag person={mockPerson} />);

      const opprettButtons = screen.getAllByRole("button", { name: "Opprett meldekort" });
      await user.click(opprettButtons[0]);

      // Modal should open with user's name
      const dialog = screen.getByRole("dialog", { name: "Opprett meldekort" });
      expect(dialog).toBeInTheDocument();
    });

    it("skal lukke opprett meldekort modal når avbryt klikkes", async () => {
      // Re-mock with feature flag enabled
      vi.resetModules();
      vi.doMock("~/utils/env.utils", () => ({
        showOpprettMeldekortManuelt: true,
      }));

      // Re-import component after mock
      const PersonlinjeModule = await import("./Personlinje");
      const PersonlinjeWithFlag = PersonlinjeModule.default;

      const user = userEvent.setup();
      renderWithProviders(<PersonlinjeWithFlag person={mockPerson} />);

      // Open modal
      const opprettButtons = screen.getAllByRole("button", { name: "Opprett meldekort" });
      await user.click(opprettButtons[0]);

      expect(screen.getByRole("dialog", { name: "Opprett meldekort" })).toBeInTheDocument();

      // Close modal
      const avbrytButton = screen.getByRole("button", { name: "Avbryt" });
      await user.click(avbrytButton);

      expect(screen.queryByRole("dialog", { name: "Opprett meldekort" })).not.toBeInTheDocument();
    });
  });

  describe("Accordion behavior på mobil", () => {
    it("skal toggle detaljer når navn-knappen klikkes på mobil", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Personlinje person={mockPerson} />);

      // Find the mobile name button (there are two navnContainer, one for mobile, one for desktop)
      const nameButtons = screen.getAllByRole("button", {
        name: /ola mellomnavn nordmann/i,
      });

      // The mobile button should exist (even if hidden by CSS)
      expect(nameButtons.length).toBeGreaterThan(0);

      // Click to expand
      await user.click(nameButtons[0]);

      // Details should be visible (aria-expanded should be true)
      expect(nameButtons[0]).toHaveAttribute("aria-expanded", "true");

      // Click again to collapse
      await user.click(nameButtons[0]);

      expect(nameButtons[0]).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Responsiv design", () => {
    it("skal ha både mobil og desktop navn-containere", () => {
      const { container } = renderWithProviders(<Personlinje person={mockPerson} />);

      // Should have navnContainerMobil class
      const mobilContainer = container.querySelector('[class*="navnContainerMobil"]');
      expect(mobilContainer).toBeInTheDocument();

      // Should have navnContainerDesktop class
      const desktopContainer = container.querySelector('[class*="navnContainerDesktop"]');
      expect(desktopContainer).toBeInTheDocument();
    });

    it("skal ha både mobil og desktop knapp-containere", () => {
      const { container } = renderWithProviders(<Personlinje person={mockPerson} />);

      // Should have knappContainerMobil class
      const mobilKnapper = container.querySelector('[class*="knappContainerMobil"]');
      expect(mobilKnapper).toBeInTheDocument();

      // Should have knappContainerDesktop class
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
