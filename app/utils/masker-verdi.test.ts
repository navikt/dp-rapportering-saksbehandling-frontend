import { describe, expect, it } from "vitest";

import { maskerVerdi } from "./masker-verdi";

describe("maskerVerdi", () => {
  describe("maskering av strenger", () => {
    it("skal maskere enkelt navn", () => {
      const resultat = maskerVerdi("Ole");

      expect(resultat).toBe("•••");
    });

    it("skal maskere fullt navn med mellomrom", () => {
      const resultat = maskerVerdi("Ole Nordmann");

      expect(resultat).toBe("••• ••••••••");
    });

    it("skal maskere navn med mellomnavn", () => {
      const resultat = maskerVerdi("Ole Johan Hansen");

      expect(resultat).toBe("••• ••••• ••••••");
    });

    it("skal bevare whitespace", () => {
      const resultat = maskerVerdi("Ole  Nordmann");

      expect(resultat).toBe("•••  ••••••••");
    });

    it("skal maskere personnummer", () => {
      const resultat = maskerVerdi("12345678901");

      expect(resultat).toBe("•••••••••••");
    });

    it("skal maskere personnummer med mellomrom", () => {
      const resultat = maskerVerdi("123456 78901");

      expect(resultat).toBe("•••••• •••••");
    });
  });

  describe("maskering av tall", () => {
    it("skal konvertere og maskere tall", () => {
      const resultat = maskerVerdi(12345);

      expect(resultat).toBe("•••••");
    });

    it("skal håndtere 0", () => {
      const resultat = maskerVerdi(0);

      expect(resultat).toBe("•");
    });

    it("skal håndtere negative tall", () => {
      const resultat = maskerVerdi(-123);

      expect(resultat).toBe("••••");
    });

    it("skal håndtere desimaltall", () => {
      const resultat = maskerVerdi(123.45);

      expect(resultat).toBe("••••••");
    });
  });

  describe("edge cases", () => {
    it("skal håndtere tom streng", () => {
      const resultat = maskerVerdi("");

      expect(resultat).toBe("");
    });

    it("skal håndtere kun mellomrom", () => {
      const resultat = maskerVerdi("   ");

      expect(resultat).toBe("   ");
    });

    it("skal håndtere kun tabs", () => {
      const resultat = maskerVerdi("\t\t");

      expect(resultat).toBe("\t\t");
    });

    it("skal håndtere kombinasjon av whitespace", () => {
      const resultat = maskerVerdi(" \t \n ");

      expect(resultat).toBe(" \t \n ");
    });

    it("skal maskere tekst med newlines", () => {
      const resultat = maskerVerdi("Ole\nNordmann");

      expect(resultat).toBe("•••\n••••••••");
    });
  });

  describe("spesialtegn", () => {
    it("skal maskere tekst med spesialtegn", () => {
      const resultat = maskerVerdi("Ole-Nordmann");

      expect(resultat).toBe("••••••••••••");
    });

    it("skal maskere e-post", () => {
      const resultat = maskerVerdi("ole@example.com");

      expect(resultat).toBe("•••••••••••••••");
    });

    it("skal maskere telefonnummer med parenteser", () => {
      const resultat = maskerVerdi("+47 (123) 45678");

      expect(resultat).toBe("••• ••••• •••••");
    });

    it("skal maskere emojis", () => {
      const resultat = maskerVerdi("Ole 😊 Nordmann");

      expect(resultat).toBe("••• •• ••••••••");
    });
  });

  describe("norske tegn", () => {
    it("skal maskere navn med æ, ø, å", () => {
      const resultat = maskerVerdi("Ærlig Øystein Åsen");

      expect(resultat).toBe("••••• ••••••• ••••");
    });

    it("skal maskere navn med store norske bokstaver", () => {
      const resultat = maskerVerdi("ÆØÅ");

      expect(resultat).toBe("•••");
    });
  });

  describe("lange strenger", () => {
    it("skal håndtere lang tekst", () => {
      const langTekst = "Dette er en veldig lang tekst som inneholder sensitiv informasjon";
      const resultat = maskerVerdi(langTekst);

      expect(resultat).toBe("••••• •• •• •••••• •••• ••••• ••• •••••••••• •••••••• •••••••••••");
      expect(resultat.length).toBe(langTekst.length);
    });

    it("skal håndtere veldig langt personnummer", () => {
      const resultat = maskerVerdi("123456789012345678901234567890");

      expect(resultat).toBe("••••••••••••••••••••••••••••••");
    });
  });

  describe("konsistens", () => {
    it("skal returnere samme lengde som input", () => {
      const input = "Ole Johan Hansen";
      const resultat = maskerVerdi(input);

      expect(resultat.length).toBe(input.length);
    });

    it("skal alltid returnere string", () => {
      expect(typeof maskerVerdi("tekst")).toBe("string");
      expect(typeof maskerVerdi(123)).toBe("string");
      expect(typeof maskerVerdi(0)).toBe("string");
    });

    it("skal maskere samme input til samme output", () => {
      const input = "Ole Nordmann";
      const resultat1 = maskerVerdi(input);
      const resultat2 = maskerVerdi(input);

      expect(resultat1).toBe(resultat2);
    });
  });

  describe("praktiske eksempler", () => {
    it("skal maskere typisk norsk navn", () => {
      const resultat = maskerVerdi("Kari Nordmann");

      expect(resultat).toBe("•••• ••••••••");
      expect(resultat.split(" ")).toHaveLength(2);
    });

    it("skal maskere norsk personnummer 11 siffer", () => {
      const resultat = maskerVerdi("01019012345");

      expect(resultat).toBe("•••••••••••");
      expect(resultat).not.toContain("0");
      expect(resultat).not.toContain("1");
    });

    it("skal ikke avsløre originalt innhold", () => {
      const sensitiv = "Ola Hansen";
      const maskert = maskerVerdi(sensitiv);

      expect(maskert).not.toContain("Ola");
      expect(maskert).not.toContain("Hansen");
      expect(maskert).not.toContain("O");
      expect(maskert).not.toContain("a");
    });
  });
});
