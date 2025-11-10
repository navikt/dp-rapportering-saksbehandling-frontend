import { describe, expect, it, vi } from "vitest";

import { action } from "~/routes/api.rapportering";
import type { IKorrigerMeldekort, ISendInnMeldekort } from "~/utils/types";

// Mock dependencies
vi.mock("~/models/rapporteringsperiode.server", () => ({
  oppdaterPeriode: vi.fn().mockResolvedValue(undefined),
  korrigerPeriode: vi.fn().mockResolvedValue("ny-meldekort-id-123"),
}));

vi.mock("~/utils/ab-test.server", () => ({
  getABTestVariant: vi.fn().mockReturnValue(null),
}));

describe("api.rapportering action", () => {
  describe("deteksjon av request-type", () => {
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
        context: {},
        unstable_pattern: "",
      });

      // Skal redirecte til perioder med det nye meldekort-IDet
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toContain("ny-meldekort-id-123");
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
        opprettetAv: "Arena",
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
        context: {},
        unstable_pattern: "",
      });

      // Skal redirecte til perioder med det eksisterende meldekort-IDet
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toContain("existing-id-456");
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
        context: {},
        unstable_pattern: "",
      });

      // Skal fallback til originalMeldekortId
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toContain("original-id-789");
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
        context: {},
        unstable_pattern: "",
      });

      // Skal behandles som korrigering og få nytt ID
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toContain("ny-meldekort-id-123");
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
        context: {},
        unstable_pattern: "",
      });
      const location = response.headers.get("Location");

      expect(location).toContain("/person/test-person-123/perioder");
      expect(location).toContain("aar=2025");
      expect(location).toContain("rapporteringsid=ny-meldekort-id-123");
      expect(location).toContain("oppdatert=ny-meldekort-id-123");
    });
  });
});
