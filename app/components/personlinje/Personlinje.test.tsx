import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { SaksbehandlerProvider } from "~/context/saksbehandler-context";
import type { IMeldekortPersonlinje } from "~/sanity/fellesKomponenter/personlinje/types";
import type { IPerson } from "~/utils/types";

import Personlinje from "./Personlinje";

function renderWithProviders(ui: React.ReactElement) {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <SaksbehandlerProvider>{ui}</SaksbehandlerProvider>,
    },
  ]);

  return render(<Stub initialEntries={["/"]} />);
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

const personlinjeData: IMeldekortPersonlinje = {
  sectionAriaLabel: "Brukerinformasjon",
  birthNumberLabel: "Fødselsnummer:",
  ageLabel: "Alder:",
  genderLabel: "Kjønn:",
  citizenshipLabel: "Statsborgerskap:",
  historyButton: "Historikk",
  createReportCardButton: "Opprett meldekort",
};

describe("Personlinje", () => {
  it("skal vise brukerens navn", () => {
    renderWithProviders(
      <Personlinje
        person={mockPerson}
        personlinjeData={personlinjeData}
        visOpprettMeldekort={false}
      />,
    );

    const nameElements = screen.getAllByText("Ola Mellomnavn Nordmann");
    expect(nameElements.length).toBe(2);
  });

  it("skal vise fødselsnummer", () => {
    renderWithProviders(
      <Personlinje
        person={mockPerson}
        personlinjeData={personlinjeData}
        visOpprettMeldekort={false}
      />,
    );

    expect(screen.getByText("12345678901")).toBeInTheDocument();
  });

  it("skal vise kopier-knapp for fødselsnummer", () => {
    renderWithProviders(
      <Personlinje
        person={mockPerson}
        personlinjeData={personlinjeData}
        visOpprettMeldekort={false}
      />,
    );

    const copyButton = screen.getByRole("button", { name: /kopier/i });
    expect(copyButton).toBeInTheDocument();
  });

  it("skal åpne historikk modal når historikk-knappen klikkes på desktop", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Personlinje
        person={mockPerson}
        personlinjeData={personlinjeData}
        visOpprettMeldekort={false}
      />,
    );

    const historikkButtons = screen.getAllByRole("button", { name: "Historikk" });
    expect(historikkButtons.length).toBeGreaterThan(0);

    await user.click(historikkButtons[0]);

    expect(
      screen.getByRole("dialog", { name: "[Mangler Sanity: historikkModal.overskrift]" }),
    ).toBeInTheDocument();
  });

  it("skal lukke historikk modal når lukk-knappen klikkes", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Personlinje
        person={mockPerson}
        personlinjeData={personlinjeData}
        visOpprettMeldekort={false}
      />,
    );

    const historikkButtons = screen.getAllByRole("button", { name: "Historikk" });
    await user.click(historikkButtons[0]);

    expect(
      screen.getByRole("dialog", { name: "[Mangler Sanity: historikkModal.overskrift]" }),
    ).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /lukk/i });
    await user.click(closeButton);

    expect(
      screen.queryByRole("dialog", { name: "[Mangler Sanity: historikkModal.overskrift]" }),
    ).not.toBeInTheDocument();
  });

  describe("Opprett meldekort feature toggle", () => {
    it("skal ikke vise opprett meldekort knapp når toggle er av", () => {
      renderWithProviders(
        <Personlinje
          person={mockPerson}
          personlinjeData={personlinjeData}
          visOpprettMeldekort={false}
        />,
      );

      expect(screen.queryByRole("button", { name: "Opprett meldekort" })).not.toBeInTheDocument();
    });

    it("skal ikke vise opprett meldekort knapp når prop ikke er satt", () => {
      renderWithProviders(
        <Personlinje
          person={mockPerson}
          personlinjeData={personlinjeData}
          visOpprettMeldekort={false}
        />,
      );

      expect(screen.queryByRole("button", { name: "Opprett meldekort" })).not.toBeInTheDocument();
    });

    it("skal vise opprett meldekort knapp når toggle er på", () => {
      renderWithProviders(
        <Personlinje person={mockPerson} personlinjeData={personlinjeData} visOpprettMeldekort />,
      );

      const opprettButtons = screen.queryAllByRole("button", { name: "Opprett meldekort" });
      expect(opprettButtons.length).toBeGreaterThan(0);
    });

    it("skal åpne opprett meldekort modal når knappen klikkes", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Personlinje person={mockPerson} personlinjeData={personlinjeData} visOpprettMeldekort />,
      );

      const opprettButtons = screen.getAllByRole("button", { name: "Opprett meldekort" });
      await user.click(opprettButtons[0]);

      expect(
        screen.getByRole("dialog", { name: "[Mangler Sanity: opprettMeldekortModal.tittel]" }),
      ).toBeInTheDocument();
    });

    it("skal lukke opprett meldekort modal når avbryt klikkes", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Personlinje person={mockPerson} personlinjeData={personlinjeData} visOpprettMeldekort />,
      );

      const opprettButtons = screen.getAllByRole("button", { name: "Opprett meldekort" });
      await user.click(opprettButtons[0]);

      expect(
        screen.getByRole("dialog", { name: "[Mangler Sanity: opprettMeldekortModal.tittel]" }),
      ).toBeInTheDocument();

      const avbrytButton = screen.getByRole("button", {
        name: "[Mangler Sanity: opprettMeldekortModal.avbrytKnapp]",
      });
      await user.click(avbrytButton);

      expect(
        screen.queryByRole("dialog", { name: "[Mangler Sanity: opprettMeldekortModal.tittel]" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accordion behavior på mobil", () => {
    it("skal toggle detaljer når navn-knappen klikkes på mobil", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Personlinje person={mockPerson} visOpprettMeldekort />);

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
      const { container } = renderWithProviders(
        <Personlinje person={mockPerson} personlinjeData={personlinjeData} visOpprettMeldekort />,
      );

      const mobilContainer = container.querySelector('[class*="navnContainerMobil"]');
      expect(mobilContainer).toBeInTheDocument();

      const desktopContainer = container.querySelector('[class*="navnContainerDesktop"]');
      expect(desktopContainer).toBeInTheDocument();
    });

    it("skal ha både mobil og desktop knapp-containere", () => {
      const { container } = renderWithProviders(
        <Personlinje
          person={mockPerson}
          personlinjeData={personlinjeData}
          visOpprettMeldekort={false}
        />,
      );

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

      renderWithProviders(
        <Personlinje
          person={maskedPerson}
          personlinjeData={personlinjeData}
          visOpprettMeldekort={false}
        />,
      );

      expect(screen.queryByRole("button", { name: /kopier/i })).not.toBeInTheDocument();
    });

    it("skal vise sensitiv styling for maskerte data", () => {
      const maskedPerson: IPerson = {
        ...mockPerson,
        fornavn: "•••••",
        etternavn: "•••••",
      };

      const { container } = renderWithProviders(
        <Personlinje
          person={maskedPerson}
          personlinjeData={personlinjeData}
          visOpprettMeldekort={false}
        />,
      );

      const sensitivElements = container.querySelectorAll('[class*="sensitiv"]');
      expect(sensitivElements.length).toBeGreaterThan(0);
    });
  });
});
