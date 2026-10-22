import { RouterContextProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { korrigerPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { action as routeAction, loader } from "~/routes/api.rapportering";
import { OPPRETTET_AV } from "~/utils/constants";
import type { IKorrigerMeldekort, ISendInnMeldekort } from "~/utils/types";

// Mock dependencies
vi.mock("~/models/rapporteringsperiode.server", () => ({
  oppdaterPeriode: vi.fn().mockResolvedValue("oppdatert-meldekort-id-456"),
  korrigerPeriode: vi.fn().mockResolvedValue("ny-meldekort-id-123"),
}));

vi.mock("~/utils/ab-test.server", () => ({
  getABTestVariant: vi.fn().mockReturnValue(null),
}));

vi.mock("~/models/logger.server", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

function actionArgs(request: Request): Parameters<typeof routeAction>[0] {
  return {
    request,
    params: {},
    context: new RouterContextProvider(),
    pattern: "",
    url: new URL(request.url),
  };
}

function kjorAction(request: Request) {
  return routeAction(actionArgs(request));
}

async function action(args: Parameters<typeof routeAction>[0]) {
  const response = await routeAction(args);
  return response instanceof Response ? response.json() : response;
}

function kjorActionData(request: Request) {
  return action(actionArgs(request));
}

describe("validering av api.rapportering", () => {
  const gyldigPeriode: IKorrigerMeldekort = {
    ident: "12345678901",
    originalMeldekortId: "original-id",
    periode: { fraOgMed: "2025-08-18", tilOgMed: "2025-08-31" },
    dager: [
      {
        type: "Arbeidsdag",
        dagIndex: 0,
        dato: "2025-08-18",
        aktiviteter: [{ id: "aktivitet-id", type: "Arbeid", dato: "2025-08-18", timer: "PT8H" }],
      },
    ],
    kilde: { rolle: "Saksbehandler", ident: "Z123456" },
    begrunnelse: "Korrigering",
    meldedato: "2025-09-01",
  };

  function lagRequest(payload: unknown = gyldigPeriode, personId = "person-id") {
    const formData = new FormData();
    formData.set("personId", personId);
    formData.set("rapporteringsperiode", JSON.stringify(payload));
    return new Request("http://localhost/api/rapportering", { method: "POST", body: formData });
  }

  beforeEach(() => vi.clearAllMocks());

  it("avviser GET med 405 og Allow: POST", () => {
    const response = loader();
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it.each(["PUT", "PATCH", "DELETE"])("avviser %s uten backend-kall", async (method) => {
    const response = await kjorAction(new Request("http://localhost/api/rapportering", { method }));
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(oppdaterPeriode).not.toHaveBeenCalled();
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  it("returnerer 400 for uleselige skjemadata", async () => {
    const response = await kjorAction(
      new Request("http://localhost/api/rapportering", { method: "POST", body: "ikke skjemadata" }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: true });
    expect(oppdaterPeriode).not.toHaveBeenCalled();
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  it.each([
    ["manglende felter", new FormData()],
    ["ugyldig JSON", new URLSearchParams({ personId: "123", rapporteringsperiode: "{" })],
  ])("returnerer 422 for %s", async (_navn, body) => {
    const response = await kjorAction(
      new Request("http://localhost/api/rapportering", { method: "POST", body }),
    );
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: true });
    expect(oppdaterPeriode).not.toHaveBeenCalled();
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  it("returnerer 422 for fil i stedet for JSON", async () => {
    const formData = new FormData();
    formData.set("personId", "123");
    formData.set("rapporteringsperiode", new Blob(["{}"]), "periode.json");
    const request = lagRequest();
    vi.spyOn(request, "formData").mockResolvedValue(formData);

    const response = await kjorAction(request);
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: true });
    expect(oppdaterPeriode).not.toHaveBeenCalled();
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  it.each([
    ["null", null],
    ["liste", []],
    ["manglende felter", {}],
    ["tom ident", { ...gyldigPeriode, ident: " " }],
    ["tom original-ID", { ...gyldigPeriode, originalMeldekortId: "" }],
    ["ugyldig original-ID", { ...gyldigPeriode, originalMeldekortId: 123 }],
    ["ugyldig meldedato", { ...gyldigPeriode, meldedato: "2025-02-30" }],
    ["null meldedato for korrigering", { ...gyldigPeriode, meldedato: null }],
    ["ugyldig rolle", { ...gyldigPeriode, kilde: { rolle: "ukjent", ident: "Z123456" } }],
    ["ugyldig begrunnelse", { ...gyldigPeriode, begrunnelse: null }],
    [
      "ugyldig periode",
      { ...gyldigPeriode, periode: { fraOgMed: "feil", tilOgMed: "2025-08-31" } },
    ],
    [
      "omvendt periode",
      { ...gyldigPeriode, periode: { fraOgMed: "2025-08-31", tilOgMed: "2025-08-18" } },
    ],
    ["manglende dager", { ...gyldigPeriode, dager: null }],
    [
      "ugyldig dagindeks",
      { ...gyldigPeriode, dager: [{ ...gyldigPeriode.dager[0], dagIndex: -1 }] },
    ],
    ["ugyldig dagdato", { ...gyldigPeriode, dager: [{ ...gyldigPeriode.dager[0], dato: "feil" }] }],
    [
      "ugyldige aktiviteter",
      { ...gyldigPeriode, dager: [{ ...gyldigPeriode.dager[0], aktiviteter: null }] },
    ],
    ...[
      { type: "ukjent", dato: "2025-08-18" },
      { type: "Arbeid", dato: "feil" },
      { type: "Arbeid", dato: "2025-08-18", timer: "8" },
      { type: "Arbeid", dato: "2025-08-18", timer: 8 },
    ].map((aktivitet): [string, unknown] => [
      `ugyldig aktivitet ${JSON.stringify(aktivitet)}`,
      { ...gyldigPeriode, dager: [{ ...gyldigPeriode.dager[0], aktiviteter: [aktivitet] }] },
    ]),
  ])("returnerer 422 uten backend-kall for %s", async (_navn, payload) => {
    const response = await kjorAction(lagRequest(payload));
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: true });
    expect(oppdaterPeriode).not.toHaveBeenCalled();
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  it("avviser personId som bare inneholder mellomrom", async () => {
    const response = await kjorAction(lagRequest(gyldigPeriode, " "));
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: true });
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  const gyldigOppdatering: ISendInnMeldekort = {
    ...gyldigPeriode,
    id: "periode-id",
    kanSendesFra: "2025-08-30T00:00:00",
    sisteFristForTrekk: null,
    opprettetAv: OPPRETTET_AV.Dagpenger,
    status: "Innsendt",
    registrertArbeidssoker: false,
    meldedato: null,
  };

  it.each([
    { id: "" },
    { kanSendesFra: "feil" },
    { sisteFristForTrekk: 123 },
    { opprettetAv: "ukjent" },
    { status: "TilUtfylling" },
    { registrertArbeidssoker: "false" },
    { innsendtTidspunkt: "feil" },
  ])("avviser ugyldige oppdateringsfelter %j", async (felter) => {
    const response = await kjorAction(
      lagRequest({ ...gyldigOppdatering, originalMeldekortId: undefined, ...felter }),
    );
    expect(response.status).toBe(422);
    expect(oppdaterPeriode).not.toHaveBeenCalled();
    expect(korrigerPeriode).not.toHaveBeenCalled();
  });

  it("godtar oppdatering med null meldedato og false arbeidssoker", async () => {
    const payload = { ...gyldigOppdatering, originalMeldekortId: undefined };
    expect(await kjorActionData(lagRequest(payload))).toHaveProperty("success", true);
    expect(oppdaterPeriode).toHaveBeenCalledWith(
      expect.objectContaining({
        periode: expect.objectContaining({ registrertArbeidssoker: false, meldedato: null }),
      }),
    );
  });

  it("bevarer dagdata og genererer nye aktivitet-IDer ved korrigering", async () => {
    expect(await kjorActionData(lagRequest())).toHaveProperty("success", true);
    expect(korrigerPeriode).toHaveBeenCalledWith(
      expect.objectContaining({
        periode: {
          ...gyldigPeriode,
          dager: [
            {
              ...gyldigPeriode.dager[0],
              aktiviteter: [
                {
                  ...gyldigPeriode.dager[0].aktiviteter[0],
                  id: expect.any(String),
                },
              ],
            },
          ],
        },
      }),
    );
    const nyAktivitetId =
      vi.mocked(korrigerPeriode).mock.calls[0][0].periode.dager[0].aktiviteter[0].id;
    expect(nyAktivitetId).not.toBe("aktivitet-id");
  });
});

/**
 * Integration tests for api.rapportering action
 *
 * Denne action håndterer innsending av både nye meldekort og korrigeringer.
 * Den må kunne:
 * 1. Detektere om det er en oppdatering eller korrigering basert på originalMeldekortId
 * 2. Kalle riktig backend-funksjon (oppdaterPeriode eller korrigerPeriode)
 * 3. Bygge riktig redirect URL basert på response fra backend
 * 4. Håndtere feil fra backend gracefully
 *
 * VIKTIG: Vi mocker kun eksterne avhengigheter (server models), ikke selve action-logikken.
 * Dette sikrer at vi tester den faktiske request-handling logikken.
 */
describe("api.rapportering action", () => {
  describe("deteksjon av request-type", () => {
    /**
     * KORRIGERING vs OPPDATERING:
     *
     * - KORRIGERING: Brukes når saksbehandler skal endre et allerede innsendt meldekort
     *   - Har originalMeldekortId felt
     *   - Kaller korrigerPeriode() backend-funksjon
     *   - Oppretter NYTT meldekort med ny ID i backend
     *
     * - OPPDATERING: Brukes når bruker fyller ut et tomt meldekort for første gang
     *   - Har IKKE originalMeldekortId felt
     *   - Kaller oppdaterPeriode() backend-funksjon
     *   - Oppdaterer eksisterende meldekort med samme ID
     */
    it("skal detektere korrigering når originalMeldekortId er til stede", async () => {
      const korrigerMeldekort: IKorrigerMeldekort = {
        ident: "12345678901",
        originalMeldekortId: "original-id-123",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test korrigering",
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekort));
      formData.append("personId", "test-person-id");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      // Skal returnere success med redirect URL
      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).toContain("ny-meldekort-id-123");
      }
    });

    it("skal detektere oppdatering når originalMeldekortId ikke er til stede", async () => {
      const sendInnMeldekort: ISendInnMeldekort = {
        ident: "12345678901",
        id: "existing-id-456",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kanSendesFra: "2025-08-30",
        sisteFristForTrekk: "2025-09-08",
        opprettetAv: OPPRETTET_AV.Arena,
        status: "Innsendt",
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test oppdatering",
        registrertArbeidssoker: true,
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(sendInnMeldekort));
      formData.append("personId", "test-person-id");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      // Skal returnere success med redirect URL
      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).toContain("existing-id-456");
      }
    });
  });

  describe("edge cases", () => {
    it("skal håndtere korrigering uten at backend returnerer nytt ID", async () => {
      const { korrigerPeriode } = await import("~/models/rapporteringsperiode.server");
      vi.mocked(korrigerPeriode).mockResolvedValueOnce(null);

      const korrigerMeldekort: IKorrigerMeldekort = {
        ident: "12345678901",
        originalMeldekortId: "original-id-789",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test korrigering uten ny ID",
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekort));
      formData.append("personId", "test-person-id");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      // Skal fallback til originalMeldekortId
      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).toContain("original-id-789");
      }
    });

    it("skal ikke feiltolke korrigering som oppdatering når kun originalMeldekortId finnes", async () => {
      // Dette er kritisk: Selv om objektet har andre felter, skal originalMeldekortId trigge korrigering
      const korrigerMeldekortMedEkstraFelter = {
        ident: "12345678901",
        originalMeldekortId: "original-id-999",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test korrigering",
        meldedato: "2025-09-01",
        // Ekstra felter som ikke skal forvirre deteksjonen
        status: "Innsendt",
        kanSendes: false,
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekortMedEkstraFelter));
      formData.append("personId", "test-person-id");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      // Skal behandles som korrigering og få nytt ID
      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).toContain("ny-meldekort-id-123");
      }
    });
  });

  describe("redirect URL", () => {
    it("skal inkludere riktige query params i redirect URL", async () => {
      const korrigerMeldekort: IKorrigerMeldekort = {
        ident: "12345678901",
        originalMeldekortId: "original-id-123",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test",
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekort));
      formData.append("personId", "test-person-123");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).toContain("/person/test-person-123/perioder");
        expect(response.redirectUrl).toContain("aar=2025");
        expect(response.redirectUrl).toContain("rapporteringsid=ny-meldekort-id-123");
        expect(response.redirectUrl).toContain("oppdatert=ny-meldekort-id-123");
      }
    });

    it("skal bevare variant fra referer header i redirect URL", async () => {
      const { getABTestVariant } = await import("~/utils/ab-test.server");
      vi.mocked(getABTestVariant).mockReturnValueOnce("B");

      const korrigerMeldekort: IKorrigerMeldekort = {
        ident: "12345678901",
        originalMeldekortId: "original-id-123",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test",
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekort));
      formData.append("personId", "test-person-123");

      // Variant kommer nå fra request URL, ikke referer
      const request = new Request("http://localhost/api/rapportering?variant=B", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).toContain("variant=B");
      }
    });

    it("skal ikke inkludere variant når den ikke finnes i referer", async () => {
      const { getABTestVariant } = await import("~/utils/ab-test.server");
      vi.mocked(getABTestVariant).mockReturnValueOnce(null);

      const korrigerMeldekort: IKorrigerMeldekort = {
        ident: "12345678901",
        originalMeldekortId: "original-id-123",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test",
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekort));
      formData.append("personId", "test-person-123");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
        headers: {
          referer: "http://localhost/person/test-person-123/periode/original-id-123/korriger",
        },
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("redirectUrl");
      if ("redirectUrl" in response) {
        expect(response.redirectUrl).not.toContain("variant=");
      }
    });
  });

  describe("error handling", () => {
    it("skal returnere error objekt når oppdaterPeriode feiler", async () => {
      const { oppdaterPeriode } = await import("~/models/rapporteringsperiode.server");
      vi.mocked(oppdaterPeriode).mockRejectedValueOnce(new Error("Database feil"));

      const sendInnMeldekort: ISendInnMeldekort = {
        ident: "12345678901",
        id: "existing-id-456",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kanSendesFra: "2025-08-30",
        sisteFristForTrekk: "2025-09-08",
        opprettetAv: OPPRETTET_AV.Arena,
        status: "Innsendt",
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test oppdatering",
        registrertArbeidssoker: true,
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(sendInnMeldekort));
      formData.append("personId", "test-person-id");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("error", true);
      expect(response).toHaveProperty("title", "Database feil");
    });

    it("skal returnere error objekt når korrigerPeriode feiler", async () => {
      const { korrigerPeriode } = await import("~/models/rapporteringsperiode.server");
      vi.mocked(korrigerPeriode).mockRejectedValueOnce(new Error("Korrigering feilet"));

      const korrigerMeldekort: IKorrigerMeldekort = {
        ident: "12345678901",
        originalMeldekortId: "original-id-123",
        periode: {
          fraOgMed: "2025-08-18",
          tilOgMed: "2025-08-31",
        },
        dager: [],
        kilde: {
          rolle: "Saksbehandler",
          ident: "Z123456",
        },
        begrunnelse: "Test korrigering",
        meldedato: "2025-09-01",
      };

      const formData = new FormData();
      formData.append("rapporteringsperiode", JSON.stringify(korrigerMeldekort));
      formData.append("personId", "test-person-id");

      const request = new Request("http://localhost/api/rapportering", {
        method: "POST",
        body: formData,
      });

      const response = await action({
        request,
        params: {},
        context: new RouterContextProvider(),
        pattern: "",
        url: new URL(request.url),
      });

      expect(response).not.toBeInstanceOf(Response);
      expect(response).toHaveProperty("error", true);
      expect(response).toHaveProperty("title", "Korrigering feilet");
    });
  });
});
