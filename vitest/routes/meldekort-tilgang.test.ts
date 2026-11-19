import { RouterContextProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { lagRapporteringsperiode, lagSaksbehandler } from "~/mocks/mock.utils";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import { loader as fyllUtLoader } from "~/routes/person.$personId.periode.$periodeId.fyll-ut";
import { loader as korrigerLoader } from "~/routes/person.$personId.periode.$periodeId.korriger";
import { sanityClient } from "~/sanity/client";

vi.mock("~/models/saksbehandler.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("~/models/saksbehandler.server")>()),
  hentSaksbehandler: vi.fn(),
}));

vi.mock("~/models/rapporteringsperiode.server", () => ({
  hentPeriode: vi.fn(),
}));

vi.mock("~/sanity/client", () => ({
  sanityClient: { fetch: vi.fn(async () => null) },
}));

vi.mock("~/models/logger.server", () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

describe.each([
  {
    navn: "fyll-ut",
    loader: fyllUtLoader,
    message: "Du har ikke tilgang til å fylle ut meldekort",
  },
  {
    navn: "korriger",
    loader: korrigerLoader,
    message: "Du har ikke tilgang til å korrigere meldekort",
  },
])("Saksbehandlertilgang til $navn", ({ navn, loader, message }) => {
  function lastRute() {
    const request = new Request(`http://localhost/person/123/periode/456/${navn}`);
    return loader({
      request,
      params: { personId: "123", periodeId: "456" },
      context: new RouterContextProvider(),
      pattern: "",
      url: new URL(request.url),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SAKSBEHANDLER_GRUPPE", "gruppe-saksbehandler");
    vi.mocked(hentPeriode).mockResolvedValue(lagRapporteringsperiode());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([{ groups: [] }, { groups: ["gruppe-les"] }, { groups: ["saksbehandler"] }])(
    "avviser uten konfigurert gruppemedlemskap: $groups",
    async ({ groups }) => {
      vi.mocked(hentSaksbehandler).mockResolvedValue(lagSaksbehandler({ groups }));

      const error: unknown = await lastRute().catch((error: unknown) => error);
      expect(error).toBeInstanceOf(Response);
      if (error instanceof Response) {
        expect(error.status).toBe(403);
        await expect(error.json()).resolves.toMatchObject({ message });
      }
      expect(hentPeriode).not.toHaveBeenCalled();
      expect(sanityClient.fetch).not.toHaveBeenCalled();
    },
  );

  it("tillater saksbehandlere med konfigurert gruppe", async () => {
    const saksbehandler = lagSaksbehandler({ groups: ["gruppe-les", "gruppe-saksbehandler"] });
    vi.mocked(hentSaksbehandler).mockResolvedValue(saksbehandler);

    await expect(lastRute()).resolves.toMatchObject({ saksbehandler });
    expect(hentPeriode).toHaveBeenCalledOnce();
  });

  it("avviser hvis saksbehandlergruppen ikke er konfigurert", async () => {
    vi.stubEnv("SAKSBEHANDLER_GRUPPE", "");
    vi.mocked(hentSaksbehandler).mockResolvedValue(lagSaksbehandler({ groups: [""] }));

    await expect(lastRute()).rejects.toMatchObject({ status: 403 });
    expect(hentPeriode).not.toHaveBeenCalled();
  });
});
