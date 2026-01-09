import { describe, expect, it } from "vitest";

import { maskerPerson, skalSkjuleSensitiveOpplysninger } from "./maskering.server";
import type { IPerson } from "./types";

describe("maskering.server", () => {
  describe("skalSkjuleSensitiveOpplysninger", () => {
    it("skal returnere true når cookie er satt til true", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=true",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(mockRequest)).toBe(true);
    });

    it("skal returnere false når cookie er satt til false", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=false",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(mockRequest)).toBe(false);
    });

    it("skal returnere true (default) når cookie ikke er satt", () => {
      const mockRequest = new Request("http://localhost");

      expect(skalSkjuleSensitiveOpplysninger(mockRequest)).toBe(true);
    });

    it("skal returnere true når cookie har ugyldig verdi", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=invalid",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(mockRequest)).toBe(true);
    });

    it("skal håndtere flere cookies", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          Cookie: "tema=dark; skjul-sensitive-opplysninger=false; sessionId=abc123",
        },
      });

      expect(skalSkjuleSensitiveOpplysninger(mockRequest)).toBe(false);
    });
  });

  describe("maskerPerson", () => {
    const mockPerson: IPerson = {
      ident: "12345678901",
      fornavn: "Ola",
      mellomnavn: "Johan",
      etternavn: "Nordmann",
      fodselsdato: "1990-01-01",
      kjonn: "MANN",
      ansvarligSystem: "DP",
    };

    it("skal maskere fornavn, etternavn og ident", () => {
      const maskert = maskerPerson(mockPerson);

      expect(maskert.fornavn).toBe("•••");
      expect(maskert.etternavn).toBe("••••••••");
      expect(maskert.ident).toBe("•••••••••••");
    });

    it("skal maskere mellomnavn hvis det finnes", () => {
      const maskert = maskerPerson(mockPerson);

      expect(maskert.mellomnavn).toBe("•••••");
    });

    it("skal bevare undefined mellomnavn", () => {
      const personUtenMellomnavn: IPerson = {
        ...mockPerson,
        mellomnavn: undefined,
      };

      const maskert = maskerPerson(personUtenMellomnavn);

      expect(maskert.mellomnavn).toBe(undefined);
    });

    it("skal ikke maskere andre felt", () => {
      const maskert = maskerPerson(mockPerson);

      expect(maskert.fodselsdato).toBe("1990-01-01");
      expect(maskert.kjonn).toBe("MANN");
    });

    it("skal ikke mutere original person-objektet", () => {
      const original = { ...mockPerson };
      maskerPerson(mockPerson);

      expect(mockPerson).toEqual(original);
    });

    it("skal håndtere norske tegn i navn", () => {
      const personMedNorskNavn: IPerson = {
        ...mockPerson,
        fornavn: "Åse",
        etternavn: "Ødegård",
      };

      const maskert = maskerPerson(personMedNorskNavn);

      expect(maskert.fornavn).toBe("•••");
      expect(maskert.etternavn).toBe("•••••••");
    });

    it("skal håndtere kort navn", () => {
      const personMedKortNavn: IPerson = {
        ...mockPerson,
        fornavn: "Li",
        etternavn: "Xu",
      };

      const maskert = maskerPerson(personMedKortNavn);

      expect(maskert.fornavn).toBe("••");
      expect(maskert.etternavn).toBe("••");
    });

    it("skal håndtere langt navn", () => {
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

  describe("Integrasjonstesting", () => {
    it("skal kun maskere person når cookie er satt til true", () => {
      const mockPerson: IPerson = {
        ident: "12345678901",
        fornavn: "Ola",
        etternavn: "Nordmann",
        fodselsdato: "1990-01-01",
        kjonn: "MANN",
        ansvarligSystem: "DP",
      };

      // Når cookie er true, skal person maskeres
      const requestMedSkjul = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=true",
        },
      });

      const skalSkjule = skalSkjuleSensitiveOpplysninger(requestMedSkjul);
      const resultat = skalSkjule ? maskerPerson(mockPerson) : mockPerson;

      expect(resultat.fornavn).toBe("•••");
      expect(resultat.etternavn).toBe("••••••••");
      expect(resultat.ident).toBe("•••••••••••");
    });

    it("skal ikke maskere person når cookie er satt til false", () => {
      const mockPerson: IPerson = {
        ident: "12345678901",
        fornavn: "Ola",
        etternavn: "Nordmann",
        fodselsdato: "1990-01-01",
        kjonn: "MANN",
        ansvarligSystem: "DP",
      };

      // Når cookie er false, skal person ikke maskeres
      const requestUtenSkjul = new Request("http://localhost", {
        headers: {
          Cookie: "skjul-sensitive-opplysninger=false",
        },
      });

      const skalSkjule = skalSkjuleSensitiveOpplysninger(requestUtenSkjul);
      const resultat = skalSkjule ? maskerPerson(mockPerson) : mockPerson;

      expect(resultat.fornavn).toBe("Ola");
      expect(resultat.etternavn).toBe("Nordmann");
      expect(resultat.ident).toBe("12345678901");
    });
  });
});
