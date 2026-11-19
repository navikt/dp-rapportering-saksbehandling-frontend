import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLoaderData, useRouteLoaderData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Rapportering, { ErrorBoundary } from "~/routes/person.$personId";

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useLoaderData: vi.fn(),
  useRouteLoaderData: vi.fn(),
  Outlet: () => null,
}));

vi.mock("~/components/personlinje/Personlinje", () => ({
  default: ({ visOpprettMeldekort }: { visOpprettMeldekort: boolean }) =>
    visOpprettMeldekort ? <button>Opprett meldekort</button> : null,
}));

describe("ErrorBoundary", () => {
  it.each([
    { status: 403, title: "Ingen tilgang" },
    { status: 404, title: "Fant ikke det du leter etter" },
    { status: 500, title: "Beklager, det har skjedd en feil" },
  ])("viser riktig overskrift for $status", ({ status, title }) => {
    vi.mocked(useRouteLoaderData).mockReturnValue({});

    render(
      <ErrorBoundary
        params={{ personId: "person-1" }}
        error={{
          status,
          statusText: "",
          internal: false,
          data: { message: "Du har ikke tilgang til å korrigere meldekort" },
        }}
      />,
      { wrapper: MemoryRouter },
    );

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText("Du har ikke tilgang til å korrigere meldekort")).toBeInTheDocument();
  });
});

describe("Tilgang til oppretting av meldekort", () => {
  it.each([
    { kanRedigere: false, toggle: true, synlig: false },
    { kanRedigere: true, toggle: false, synlig: false },
    { kanRedigere: true, toggle: true, synlig: true },
    { kanRedigere: undefined, toggle: true, synlig: false },
  ])(
    "kanRedigere=$kanRedigere, toggle=$toggle gir synlig=$synlig",
    ({ kanRedigere, toggle, synlig }) => {
      vi.mocked(useRouteLoaderData).mockReturnValue({ kanRedigere });
      vi.mocked(useLoaderData).mockReturnValue({
        personId: "person-1",
        person: {},
        perioder: [],
        arbeidssokerperioder: [],
        showDemoTools: false,
        visOpprettMeldekort: toggle,
      });

      render(<Rapportering />);

      expect(screen.queryByRole("button", { name: "Opprett meldekort" }) !== null).toBe(synlig);
    },
  );

  it.each([false, true])("bruker redigeringstilgang også i feilvisningen: %s", (kanRedigere) => {
    vi.mocked(useRouteLoaderData).mockReturnValue({ kanRedigere });

    render(
      <ErrorBoundary
        params={{ personId: "person-1" }}
        error={{
          status: 500,
          statusText: "Internal Server Error",
          internal: false,
          data: {
            personContext: {
              personId: "person-1",
              person: {},
              showDemoTools: false,
              visOpprettMeldekort: true,
            },
          },
        }}
      />,
    );

    expect(screen.queryByRole("button", { name: "Opprett meldekort" }) !== null).toBe(kanRedigere);
  });
});
