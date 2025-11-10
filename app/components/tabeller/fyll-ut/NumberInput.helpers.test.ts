import { describe, expect, it } from "vitest";

import {
  dekrementerTimer,
  erVedMaksimum,
  erVedMinimum,
  inkrementerTimer,
  MAX_TIMER,
  MIN_TIMER,
  STEP_TIMER,
  validerTimerGrenser,
  validerTimerInput,
  validerTimerSteg,
} from "./NumberInput.helpers";

describe("NumberInput.helpers", () => {
  describe("Constants", () => {
    it("skal ha riktige konstantverdier", () => {
      expect(MIN_TIMER).toBe(0.5);
      expect(MAX_TIMER).toBe(24);
      expect(STEP_TIMER).toBe(0.5);
    });
  });

  describe("validerTimerGrenser", () => {
    it("skal godkjenne verdi innenfor grenser", () => {
      const result = validerTimerGrenser(8);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it("skal godkjenne minimum verdi", () => {
      const result = validerTimerGrenser(MIN_TIMER);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it("skal godkjenne maksimum verdi", () => {
      const result = validerTimerGrenser(MAX_TIMER);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it("skal avvise verdi under minimum", () => {
      const result = validerTimerGrenser(0.2);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Minimum 0.5 timer");
    });

    it("skal avvise verdi over maksimum", () => {
      const result = validerTimerGrenser(25);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Maksimum 24 timer");
    });

    it("skal avvise 0", () => {
      const result = validerTimerGrenser(0);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Minimum 0.5 timer");
    });

    it("skal avvise negative tall", () => {
      const result = validerTimerGrenser(-1);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Minimum 0.5 timer");
    });
  });

  describe("validerTimerSteg", () => {
    it("skal godkjenne hele tall", () => {
      expect(validerTimerSteg(1).isValid).toBe(true);
      expect(validerTimerSteg(8).isValid).toBe(true);
      expect(validerTimerSteg(24).isValid).toBe(true);
    });

    it("skal godkjenne halve timer (.5)", () => {
      expect(validerTimerSteg(0.5).isValid).toBe(true);
      expect(validerTimerSteg(7.5).isValid).toBe(true);
      expect(validerTimerSteg(12.5).isValid).toBe(true);
    });

    it("skal avvise desimaler som ikke er .5", () => {
      const result1 = validerTimerSteg(7.3);
      expect(result1.isValid).toBe(false);
      expect(result1.errorMessage).toBe("Kun hele eller halve timer (f.eks. 2 eller 2.5)");

      const result2 = validerTimerSteg(8.75);
      expect(result2.isValid).toBe(false);
    });

    it("skal avvise 0.25", () => {
      const result = validerTimerSteg(0.25);
      expect(result.isValid).toBe(false);
    });

    it("skal godkjenne 0", () => {
      const result = validerTimerSteg(0);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validerTimerInput", () => {
    it("skal godkjenne tom streng", () => {
      const result = validerTimerInput("");
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it("skal godkjenne gyldig tallverdi", () => {
      const result = validerTimerInput("7.5");
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it("skal avvise ugyldig tall", () => {
      const result = validerTimerInput("abc");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Ugyldig tall");
    });

    it("skal avvise tall under minimum", () => {
      const result = validerTimerInput("0.2");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Minimum 0.5 timer");
    });

    it("skal avvise tall over maksimum", () => {
      const result = validerTimerInput("25");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Maksimum 24 timer");
    });

    it("skal avvise ugyldige steg", () => {
      const result = validerTimerInput("7.3");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Kun hele eller halve timer (f.eks. 2 eller 2.5)");
    });

    it("skal godkjenne minimum verdi", () => {
      const result = validerTimerInput("0.5");
      expect(result.isValid).toBe(true);
    });

    it("skal godkjenne maksimum verdi", () => {
      const result = validerTimerInput("24");
      expect(result.isValid).toBe(true);
    });

    it("skal håndtere flere edge cases", () => {
      expect(validerTimerInput("0").isValid).toBe(false); // Under minimum
      expect(validerTimerInput("8").isValid).toBe(true); // Hele timer
      expect(validerTimerInput("8.5").isValid).toBe(true); // Halv time
      expect(validerTimerInput("8.25").isValid).toBe(false); // Ugyldig steg
      expect(validerTimerInput("30").isValid).toBe(false); // Over maksimum
    });

    it("skal avvise input som bare består av punktum", () => {
      const result = validerTimerInput(".");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Ugyldig tall");
    });

    it("skal avvise input som bare består av komma", () => {
      const result = validerTimerInput(",");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Ugyldig tall");
    });

    it("skal avvise input som bare består av flere punktum/komma", () => {
      expect(validerTimerInput("..").isValid).toBe(false);
      expect(validerTimerInput(",,").isValid).toBe(false);
      expect(validerTimerInput(".,").isValid).toBe(false);
      expect(validerTimerInput(".,.").isValid).toBe(false);
    });

    it("skal avvise input med punktum/komma og mellomrom", () => {
      expect(validerTimerInput(". ").isValid).toBe(false);
      expect(validerTimerInput(" .").isValid).toBe(false);
      expect(validerTimerInput(" . ").isValid).toBe(false);
    });

    it("skal godkjenne gyldige desimaler med punktum", () => {
      expect(validerTimerInput("7.5").isValid).toBe(true);
      expect(validerTimerInput("10.5").isValid).toBe(true);
    });
  });

  describe("inkrementerTimer", () => {
    it("skal øke verdi med STEP", () => {
      expect(inkrementerTimer(7)).toBe(7.5);
      expect(inkrementerTimer(7.5)).toBe(8);
    });

    it("skal ikke overstige maksimum", () => {
      expect(inkrementerTimer(23.5)).toBe(24);
      expect(inkrementerTimer(24)).toBe(24);
    });

    it("skal håndtere 0", () => {
      expect(inkrementerTimer(0)).toBe(0.5);
    });

    it("skal håndtere minimum verdi", () => {
      expect(inkrementerTimer(MIN_TIMER)).toBe(1);
    });
  });

  describe("dekrementerTimer", () => {
    it("skal redusere verdi med STEP", () => {
      expect(dekrementerTimer(8)).toBe(7.5);
      expect(dekrementerTimer(7.5)).toBe(7);
    });

    it("skal ikke gå under minimum", () => {
      expect(dekrementerTimer(1)).toBe(0.5);
      expect(dekrementerTimer(0.5)).toBe(0.5);
    });

    it("skal håndtere maksimum verdi", () => {
      expect(dekrementerTimer(MAX_TIMER)).toBe(23.5);
    });

    it("skal håndtere minimum verdi", () => {
      expect(dekrementerTimer(MIN_TIMER)).toBe(MIN_TIMER);
    });
  });

  describe("erVedMaksimum", () => {
    it("skal returnere true når verdi er ved eller over maksimum", () => {
      expect(erVedMaksimum(24)).toBe(true);
      expect(erVedMaksimum(25)).toBe(true);
    });

    it("skal returnere false når verdi er under maksimum", () => {
      expect(erVedMaksimum(23.5)).toBe(false);
      expect(erVedMaksimum(20)).toBe(false);
      expect(erVedMaksimum(0)).toBe(false);
    });
  });

  describe("erVedMinimum", () => {
    it("skal returnere true når verdi er ved eller under minimum", () => {
      expect(erVedMinimum(0.5)).toBe(true);
      expect(erVedMinimum(0)).toBe(true);
      expect(erVedMinimum(-1)).toBe(true);
    });

    it("skal returnere false når verdi er over minimum", () => {
      expect(erVedMinimum(1)).toBe(false);
      expect(erVedMinimum(8)).toBe(false);
      expect(erVedMinimum(24)).toBe(false);
    });
  });

  describe("Edge cases og integrasjonsscenarier", () => {
    it("skal håndtere komplett inkrement-syklus fra min til maks", () => {
      let value = MIN_TIMER;
      const values = [value];

      while (value < MAX_TIMER) {
        value = inkrementerTimer(value);
        values.push(value);
      }

      expect(values[0]).toBe(0.5);
      expect(values[values.length - 1]).toBe(24);
      expect(values.length).toBe(48); // (24 - 0.5) / 0.5 + 1
    });

    it("skal håndtere komplett dekrement-syklus fra maks til min", () => {
      let value = MAX_TIMER;
      const values = [value];

      while (value > MIN_TIMER) {
        value = dekrementerTimer(value);
        values.push(value);
      }

      expect(values[0]).toBe(24);
      expect(values[values.length - 1]).toBe(0.5);
      expect(values.length).toBe(48);
    });

    it("skal validere alle steg fra min til maks", () => {
      for (let i = MIN_TIMER; i <= MAX_TIMER; i += STEP_TIMER) {
        const result = validerTimerInput(i.toString());
        expect(result.isValid).toBe(true);
      }
    });
  });
});
