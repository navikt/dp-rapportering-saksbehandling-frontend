import { RouterContextProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { action, loader } from "~/routes/api.opprett-meldekort";
import { getTodayIsoDate } from "~/utils/dato.utils";

const opprettMeldekort = vi.hoisted(() => vi.fn());

vi.mock("~/models/rapporteringsperiode.server", () => ({
  opprettMeldekort,
}));

vi.mock("~/models/logger.server", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

function lagRequest(felter: Record<string, string>, method = "POST") {
  const formData = new FormData();
  Object.entries(felter).forEach(([key, value]) => formData.append(key, value));

  return new Request("http://localhost/api/opprett-meldekort", { method, body: formData });
}

function kjorAction(request: Request) {
  return action({
    request,
    params: {},
    context: new RouterContextProvider(),
    pattern: "",
    url: new URL(request.url),
  });
}

describe("api.opprett-meldekort", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loader svarer 405 med Allow: POST", async () => {
    const response = await loader();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it("avviser andre metoder enn POST", async () => {
    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }, "PUT"),
    );

    expect(response.status).toBe(405);
    expect(opprettMeldekort).not.toHaveBeenCalled();
  });

  it("returnerer 422 ved manglende felter", async () => {
    const response = await kjorAction(lagRequest({ personId: "123" }));

    expect(response.status).toBe(422);
    expect(opprettMeldekort).not.toHaveBeenCalled();
  });

  it("returnerer 422 ved ugyldig datoformat", async () => {
    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "06.01.2025", tilOgMed: "2025-01-19" }),
    );

    expect(response.status).toBe(422);
    expect(opprettMeldekort).not.toHaveBeenCalled();
  });

  it("returnerer 422 når fra-dato er etter til-dato", async () => {
    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "2025-01-19", tilOgMed: "2025-01-06" }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: "Fra-dato må være før eller lik til-dato.",
    });
    expect(opprettMeldekort).not.toHaveBeenCalled();
  });

  it("returnerer 422 når datoene er frem i tid", async () => {
    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "2999-01-06", tilOgMed: "2999-01-19" }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: "Fra-dato og til-dato kan ikke være frem i tid.",
    });
    expect(opprettMeldekort).not.toHaveBeenCalled();
  });

  it("oppretter meldekort og returnerer perioder ved suksess", async () => {
    const perioder = [{ fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }];
    opprettMeldekort.mockResolvedValue({ perioder });

    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }),
    );

    expect(opprettMeldekort).toHaveBeenCalledWith(
      expect.objectContaining({ personId: "123", fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }),
    );
    await expect(response.json()).resolves.toEqual({ success: true, perioder });
  });

  it("godtar dagens dato", async () => {
    opprettMeldekort.mockResolvedValue({ perioder: [] });
    const today = getTodayIsoDate();

    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: today, tilOgMed: today }),
    );

    await expect(response.json()).resolves.toMatchObject({ success: true });
  });

  it("videreformidler feilrespons fra backend", async () => {
    opprettMeldekort.mockRejectedValue(
      Response.json(
        { error: "Ugyldig periode", details: "Perioden finnes allerede", correlationId: "abc" },
        { status: 409 },
      ),
    );

    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Ugyldig periode",
      detail: "Perioden finnes allerede",
      correlationId: "abc",
      status: 409,
    });
  });

  it("returnerer 500 ved uventet feil", async () => {
    opprettMeldekort.mockRejectedValue(new Error("boom"));

    const response = await kjorAction(
      lagRequest({ personId: "123", fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Kunne ikke opprette meldekort.",
    });
  });
});
