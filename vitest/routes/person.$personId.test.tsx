import { render, screen } from "@testing-library/react";
import { useLoaderData, useRouteLoaderData } from "react-router";
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
