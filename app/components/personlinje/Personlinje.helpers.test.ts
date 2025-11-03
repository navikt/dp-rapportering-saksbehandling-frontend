import { describe, expect, it } from "vitest";

import {
  beregnAlder,
  byggFulltNavn,
  erKvinne,
  erMann,
  formaterSensitivTekst,
  getKjonnKlasse,
} from "./Personlinje.helpers";

describe("Personlinje.helpers", () => {
  describe("byggFulltNavn", () => {
    it("skal bygge fullt navn med fornavn, mellomnavn og etternavn", () => {
      expect(byggFulltNavn("Ole", "Johan", "Hansen")).toBe("Ole Johan Hansen");
    });

    it("skal bygge fullt navn uten mellomnavn", () => {
      expect(byggFulltNavn("Kari", null, "Nordmann")).toBe("Kari Nordmann");
    });

    it("skal håndtere undefined mellomnavn", () => {
      expect(byggFulltNavn("Per", undefined, "Berg")).toBe("Per Berg");
    });

    it("skal håndtere tom streng som mellomnavn", () => {
      expect(byggFulltNavn("Ane", "", "Svendsen")).toBe("Ane Svendsen");
    });

    it("skal håndtere bare fornavn og etternavn", () => {
      expect(byggFulltNavn("Lisa", null, "Jensen")).toBe("Lisa Jensen");
    });

    it("skal håndtere flere mellomrom mellom navn", () => {
      const resultat = byggFulltNavn("Ola", "Petter", "Larsen");
      expect(resultat).toBe("Ola Petter Larsen");
      expect(resultat.split(" ")).toHaveLength(3);
    });
  });

  describe("beregnAlder", () => {
    it("skal beregne riktig alder basert på fødselsdato", () => {
      // Person født for 30 år siden
      const fodselsdato = new Date();
      fodselsdato.setFullYear(fodselsdato.getFullYear() - 30);

      expect(beregnAlder(fodselsdato)).toBe(30);
    });

    it("skal håndtere Date-objekt", () => {
      const fodselsdato = new Date("1990-01-01");
      const alder = beregnAlder(fodselsdato);

      // Alder vil variere basert på nåværende dato, så sjekk at det er rimelig
      expect(alder).toBeGreaterThan(30);
      expect(alder).toBeLessThan(40);
    });

    it("skal håndtere ISO string datoformat", () => {
      const fodselsdato = "1990-01-01T00:00:00.000Z";
      const alder = beregnAlder(fodselsdato);

      expect(alder).toBeGreaterThan(30);
      expect(alder).toBeLessThan(40);
    });

    it("skal beregne alder 0 for nyfødt", () => {
      const iDag = new Date();
      expect(beregnAlder(iDag)).toBe(0);
    });

    it("skal beregne alder 1 for barn født for 1 år siden", () => {
      const etArSiden = new Date();
      etArSiden.setFullYear(etArSiden.getFullYear() - 1);

      expect(beregnAlder(etArSiden)).toBe(1);
    });

    it("skal beregne riktig alder for personer over 100 år", () => {
      const fodselsdato = new Date();
      fodselsdato.setFullYear(fodselsdato.getFullYear() - 105);

      expect(beregnAlder(fodselsdato)).toBe(105);
    });
  });

  describe("getKjonnKlasse", () => {
    it("skal returnere 'iconContainerMann' for MANN", () => {
      expect(getKjonnKlasse("MANN")).toBe("iconContainerMann");
    });

    it("skal returnere 'iconContainerKvinne' for KVINNE", () => {
      expect(getKjonnKlasse("KVINNE")).toBe("iconContainerKvinne");
    });

    it("skal returnere tom streng for null", () => {
      expect(getKjonnKlasse(null)).toBe("");
    });

    it("skal returnere tom streng for undefined", () => {
      expect(getKjonnKlasse(undefined)).toBe("");
    });

    it("skal returnere tom streng for ukjent kjønn", () => {
      expect(getKjonnKlasse("UKJENT")).toBe("");
    });

    it("skal returnere tom streng for tom streng", () => {
      expect(getKjonnKlasse("")).toBe("");
    });

    it("skal være case-sensitive", () => {
      expect(getKjonnKlasse("mann")).toBe("");
      expect(getKjonnKlasse("kvinne")).toBe("");
      expect(getKjonnKlasse("Mann")).toBe("");
    });
  });

  describe("erMann", () => {
    it("skal returnere true for MANN", () => {
      expect(erMann("MANN")).toBe(true);
    });

    it("skal returnere false for KVINNE", () => {
      expect(erMann("KVINNE")).toBe(false);
    });

    it("skal returnere false for null", () => {
      expect(erMann(null)).toBe(false);
    });

    it("skal returnere false for undefined", () => {
      expect(erMann(undefined)).toBe(false);
    });

    it("skal returnere false for tom streng", () => {
      expect(erMann("")).toBe(false);
    });

    it("skal være case-sensitive", () => {
      expect(erMann("mann")).toBe(false);
      expect(erMann("Mann")).toBe(false);
    });
  });

  describe("erKvinne", () => {
    it("skal returnere true for KVINNE", () => {
      expect(erKvinne("KVINNE")).toBe(true);
    });

    it("skal returnere false for MANN", () => {
      expect(erKvinne("MANN")).toBe(false);
    });

    it("skal returnere false for null", () => {
      expect(erKvinne(null)).toBe(false);
    });

    it("skal returnere false for undefined", () => {
      expect(erKvinne(undefined)).toBe(false);
    });

    it("skal returnere false for tom streng", () => {
      expect(erKvinne("")).toBe(false);
    });

    it("skal være case-sensitive", () => {
      expect(erKvinne("kvinne")).toBe(false);
      expect(erKvinne("Kvinne")).toBe(false);
    });
  });

  describe("formaterSensitivTekst", () => {
    const mockMaskeringsFunksjon = () => "***";

    it("skal returnere maskert tekst når erSkjult er true", () => {
      const resultat = formaterSensitivTekst("Ola Nordmann", true, mockMaskeringsFunksjon);

      expect(resultat.tekst).toBe("***");
      expect(resultat.erSensitiv).toBe(true);
    });

    it("skal returnere original tekst når erSkjult er false", () => {
      const resultat = formaterSensitivTekst("Ola Nordmann", false, mockMaskeringsFunksjon);

      expect(resultat.tekst).toBe("Ola Nordmann");
      expect(resultat.erSensitiv).toBe(false);
    });

    it("skal kalle maskeringsfunksjon med riktig input", () => {
      let kaltMed: string | null = null;
      const mockFn = (tekst: string) => {
        kaltMed = tekst;
        return "maskert";
      };

      formaterSensitivTekst("Sensitiv Info", true, mockFn);

      expect(kaltMed).toBe("Sensitiv Info");
    });

    it("skal ikke kalle maskeringsfunksjon når erSkjult er false", () => {
      let ble_kalt = false;
      const mockFn = () => {
        ble_kalt = true;
        return "maskert";
      };

      formaterSensitivTekst("Info", false, mockFn);

      expect(ble_kalt).toBe(false);
    });

    it("skal håndtere tom streng", () => {
      const resultat = formaterSensitivTekst("", true, mockMaskeringsFunksjon);

      expect(resultat.tekst).toBe("***");
      expect(resultat.erSensitiv).toBe(true);
    });

    it("skal håndtere lang tekst", () => {
      const langTekst = "Dette er en veldig lang tekst som skal maskeres";
      const resultat = formaterSensitivTekst(langTekst, false, mockMaskeringsFunksjon);

      expect(resultat.tekst).toBe(langTekst);
      expect(resultat.erSensitiv).toBe(false);
    });
  });

  describe("Integrasjonstester", () => {
    it("skal bygge fullt navn og beregne alder for en person", () => {
      const navn = byggFulltNavn("Ole", "Johan", "Hansen");
      const fodselsdato = new Date();
      fodselsdato.setFullYear(fodselsdato.getFullYear() - 35);
      const alder = beregnAlder(fodselsdato);

      expect(navn).toBe("Ole Johan Hansen");
      expect(alder).toBe(35);
    });

    it("skal håndtere kjønn og navn sammen", () => {
      const kjonn = "MANN";
      const navn = byggFulltNavn("Per", null, "Berg");
      const klasse = getKjonnKlasse(kjonn);

      expect(erMann(kjonn)).toBe(true);
      expect(klasse).toBe("iconContainerMann");
      expect(navn).toBe("Per Berg");
    });
  });
});
