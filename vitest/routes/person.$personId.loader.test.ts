import { describe, expect, it } from "vitest";

import { maskerPerson, skalSkjuleSensitiveOpplysninger } from "~/utils/maskering.server";
import type { IPerson } from "~/utils/types";

describe("Maskering av sensitive data - integrasjonstest", () => {
  const mockPerson: IPerson = {
    ident: "12345678901",
    fornavn: "Ola",
    etternavn: "Nordmann",
    fodselsdato: "1990-01-01",
    kjonn: "MANN",
    ansvarligSystem: "DP",
  };

  describe("Cookie-parsing", () => {
    it("skal parse cookie med true korrekt", () => {
      const request = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=true",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(request)).toBe(true);
    });

    it("skal parse cookie med false korrekt", () => {
      const request = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=false",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(request)).toBe(false);
    });

    it("skal default til true når cookie ikke er satt (sikker default)", () => {
      const request = new Request("http://localhost");

      expect(skalSkjuleSensitiveOpplysninger(request)).toBe(true);
    });

    it("skal håndtere multiple cookies", () => {
      const request = new Request("http://localhost", {
        headers: {
          Cookie: "tema=dark; skjul-sensitive-opplysninger=false; sessionId=123",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(request)).toBe(false);
    });
  });

  describe("Masker person-funksjon", () => {
    it("skal maskere fornavn, etternavn og ident", () => {
      const maskert = maskerPerson(mockPerson);

      expect(maskert.fornavn).toBe("•••");
      expect(maskert.etternavn).toBe("••••••••");
      expect(maskert.ident).toBe("•••••••••••");
    });

    it("skal bevare andre felt", () => {
      const maskert = maskerPerson(mockPerson);

      expect(maskert.fodselsdato).toBe("1990-01-01");
      expect(maskert.kjonn).toBe("MANN");
    });

    it("skal maskere mellomnavn hvis det finnes", () => {
      const personMedMellomnavn: IPerson = {
        ...mockPerson,
        mellomnavn: "Johan",
      };

      const maskert = maskerPerson(personMedMellomnavn);

      expect(maskert.mellomnavn).toBe("•••••");
    });

    it("skal bevare undefined mellomnavn", () => {
      const maskert = maskerPerson(mockPerson);

      expect(maskert.mellomnavn).toBe(undefined);
    });

    it("skal ikke mutere original person-objekt", () => {
      const original = { ...mockPerson };
      maskerPerson(mockPerson);

      expect(mockPerson).toEqual(original);
    });
  });

  describe("Sikkerhetstesting", () => {
    it("skal ikke lekke sensitive data i JSON når maskert", () => {
      const maskert = maskerPerson(mockPerson);
      const jsonString = JSON.stringify(maskert);

      // Verifiser at INGEN sensitive data finnes i JSON
      expect(jsonString).not.toContain("Ola");
      expect(jsonString).not.toContain("Nordmann");
      expect(jsonString).not.toContain("12345678901");

      // Men maskerte data skal være der
      expect(jsonString).toContain("•");
    });

    it("skal maskere norske tegn korrekt", () => {
      const personMedNorskeTegn: IPerson = {
        ...mockPerson,
        fornavn: "Åse",
        etternavn: "Ødegård",
      };

      const maskert = maskerPerson(personMedNorskeTegn);

      expect(maskert.fornavn).toBe("•••");
      expect(maskert.etternavn).toBe("•••••••");

      // Skal ikke lekke i JSON
      const jsonString = JSON.stringify(maskert);
      expect(jsonString).not.toContain("Åse");
      expect(jsonString).not.toContain("Ødegård");
    });

    it("skal maskere korte navn", () => {
      const personMedKortNavn: IPerson = {
        ...mockPerson,
        fornavn: "Li",
        etternavn: "Xu",
      };

      const maskert = maskerPerson(personMedKortNavn);

      expect(maskert.fornavn).toBe("••");
      expect(maskert.etternavn).toBe("••");
    });

    it("skal maskere lange navn", () => {
      const personMedLangtNavn: IPerson = {
        ...mockPerson,
        fornavn: "Christopher",
        etternavn: "Johannessen",
      };

      const maskert = maskerPerson(personMedLangtNavn);

      expect(maskert.fornavn).toBe("•••••••••••");
      expect(maskert.etternavn).toBe("•••••••••••");
    });
  });

  describe("End-to-end scenario", () => {
    it("skal maskere person når cookie sier det skal skjules", () => {
      const request = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=true",
        },
      });

      const skalSkjule = skalSkjuleSensitiveOpplysninger(request);
      const result = skalSkjule ? maskerPerson(mockPerson) : mockPerson;

      expect(result.fornavn).toBe("•••");
      expect(result.etternavn).toBe("••••••••");
      expect(result.ident).toBe("•••••••••••");
    });

    it("skal IKKE maskere person når cookie sier det skal vises", () => {
      const request = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=false",
        },
      });

      const skalSkjule = skalSkjuleSensitiveOpplysninger(request);
      const result = skalSkjule ? maskerPerson(mockPerson) : mockPerson;

      expect(result.fornavn).toBe("Ola");
      expect(result.etternavn).toBe("Nordmann");
      expect(result.ident).toBe("12345678901");
    });

    it("skal maskere som default (sikker side)", () => {
      const request = new Request("http://localhost");

      const skalSkjule = skalSkjuleSensitiveOpplysninger(request);
      const result = skalSkjule ? maskerPerson(mockPerson) : mockPerson;

      expect(result.fornavn).toBe("•••");
      expect(result.etternavn).toBe("••••••••");
      expect(result.ident).toBe("•••••••••••");
    });
  });
});
