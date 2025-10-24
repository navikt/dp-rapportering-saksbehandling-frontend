import { describe, expect, it } from "vitest";

import { getActivityClasses, getActivityDotColor } from "./aktivitet.utils";
import { AKTIVITET_TYPE } from "./constants";

describe("aktivitet.utils", () => {
  describe("getActivityClasses", () => {
    describe("ingen aktiviteter", () => {
      it("skal returnere tomme strenger når aktiviteter er undefined", () => {
        const result = getActivityClasses(undefined);

        expect(result.datoColor).toBe("");
        expect(result.bgColor).toBe("");
      });

      it("skal returnere tomme strenger når aktiviteter er tom array", () => {
        const result = getActivityClasses([]);

        expect(result.datoColor).toBe("");
        expect(result.bgColor).toBe("");
      });
    });

    describe("enkeltaktiviteter", () => {
      it("skal returnere riktige klasser for Arbeid", () => {
        const result = getActivityClasses([{ type: AKTIVITET_TYPE.Arbeid }]);

        expect(result.datoColor).toBeTruthy();
        expect(result.bgColor).toBeTruthy();
      });

      it("skal returnere riktige klasser for Syk", () => {
        const result = getActivityClasses([{ type: AKTIVITET_TYPE.Syk }]);

        expect(result.datoColor).toBeTruthy();
        expect(result.bgColor).toBeTruthy();
      });

      it("skal returnere riktige klasser for Fravaer", () => {
        const result = getActivityClasses([{ type: AKTIVITET_TYPE.Fravaer }]);

        expect(result.datoColor).toBeTruthy();
        expect(result.bgColor).toBeTruthy();
      });

      it("skal returnere riktige klasser for Utdanning", () => {
        const result = getActivityClasses([{ type: AKTIVITET_TYPE.Utdanning }]);

        expect(result.datoColor).toBeTruthy();
        expect(result.bgColor).toBeTruthy();
      });
    });

    describe("prioritering av aktiviteter", () => {
      it("skal prioritere Syk over Arbeid", () => {
        const medSyk = getActivityClasses([
          { type: AKTIVITET_TYPE.Arbeid },
          { type: AKTIVITET_TYPE.Syk },
        ]);
        const kunSyk = getActivityClasses([{ type: AKTIVITET_TYPE.Syk }]);

        expect(medSyk.datoColor).toBe(kunSyk.datoColor);
        expect(medSyk.bgColor).toBe(kunSyk.bgColor);
      });

      it("skal prioritere Syk over Fravaer", () => {
        const medSyk = getActivityClasses([
          { type: AKTIVITET_TYPE.Fravaer },
          { type: AKTIVITET_TYPE.Syk },
        ]);
        const kunSyk = getActivityClasses([{ type: AKTIVITET_TYPE.Syk }]);

        expect(medSyk.datoColor).toBe(kunSyk.datoColor);
        expect(medSyk.bgColor).toBe(kunSyk.bgColor);
      });

      it("skal prioritere Syk over Utdanning", () => {
        const medSyk = getActivityClasses([
          { type: AKTIVITET_TYPE.Utdanning },
          { type: AKTIVITET_TYPE.Syk },
        ]);
        const kunSyk = getActivityClasses([{ type: AKTIVITET_TYPE.Syk }]);

        expect(medSyk.datoColor).toBe(kunSyk.datoColor);
        expect(medSyk.bgColor).toBe(kunSyk.bgColor);
      });

      it("skal prioritere Fravaer over Arbeid", () => {
        const medFravaer = getActivityClasses([
          { type: AKTIVITET_TYPE.Arbeid },
          { type: AKTIVITET_TYPE.Fravaer },
        ]);
        const kunFravaer = getActivityClasses([{ type: AKTIVITET_TYPE.Fravaer }]);

        expect(medFravaer.datoColor).toBe(kunFravaer.datoColor);
        expect(medFravaer.bgColor).toBe(kunFravaer.bgColor);
      });

      it("skal prioritere Fravaer over Utdanning", () => {
        const medFravaer = getActivityClasses([
          { type: AKTIVITET_TYPE.Utdanning },
          { type: AKTIVITET_TYPE.Fravaer },
        ]);
        const kunFravaer = getActivityClasses([{ type: AKTIVITET_TYPE.Fravaer }]);

        expect(medFravaer.datoColor).toBe(kunFravaer.datoColor);
        expect(medFravaer.bgColor).toBe(kunFravaer.bgColor);
      });

      it("skal prioritere Arbeid over Utdanning", () => {
        const medArbeid = getActivityClasses([
          { type: AKTIVITET_TYPE.Utdanning },
          { type: AKTIVITET_TYPE.Arbeid },
        ]);
        const kunArbeid = getActivityClasses([{ type: AKTIVITET_TYPE.Arbeid }]);

        expect(medArbeid.datoColor).toBe(kunArbeid.datoColor);
        expect(medArbeid.bgColor).toBe(kunArbeid.bgColor);
      });

      it("skal bruke Syk når alle aktiviteter er til stede", () => {
        const alleAktiviteter = getActivityClasses([
          { type: AKTIVITET_TYPE.Arbeid },
          { type: AKTIVITET_TYPE.Syk },
          { type: AKTIVITET_TYPE.Fravaer },
          { type: AKTIVITET_TYPE.Utdanning },
        ]);
        const kunSyk = getActivityClasses([{ type: AKTIVITET_TYPE.Syk }]);

        expect(alleAktiviteter.datoColor).toBe(kunSyk.datoColor);
        expect(alleAktiviteter.bgColor).toBe(kunSyk.bgColor);
      });
    });

    describe("edge cases", () => {
      it("skal håndtere ukjent aktivitetstype", () => {
        const result = getActivityClasses([{ type: "UkjentType" }]);

        expect(result.datoColor).toBe("");
        expect(result.bgColor).toBe("");
      });

      it("skal håndtere blanding av kjente og ukjente typer", () => {
        const result = getActivityClasses([
          { type: "UkjentType" },
          { type: AKTIVITET_TYPE.Arbeid },
        ]);

        expect(result.datoColor).toBeTruthy();
        expect(result.bgColor).toBeTruthy();
      });

      it("skal håndtere duplikate aktiviteter", () => {
        const result = getActivityClasses([
          { type: AKTIVITET_TYPE.Arbeid },
          { type: AKTIVITET_TYPE.Arbeid },
          { type: AKTIVITET_TYPE.Arbeid },
        ]);

        expect(result.datoColor).toBeTruthy();
        expect(result.bgColor).toBeTruthy();
      });
    });

    describe("rekkefølge uavhengighet", () => {
      it("skal gi samme resultat uavhengig av rekkefølge", () => {
        const resultat1 = getActivityClasses([
          { type: AKTIVITET_TYPE.Arbeid },
          { type: AKTIVITET_TYPE.Syk },
        ]);
        const resultat2 = getActivityClasses([
          { type: AKTIVITET_TYPE.Syk },
          { type: AKTIVITET_TYPE.Arbeid },
        ]);

        expect(resultat1.datoColor).toBe(resultat2.datoColor);
        expect(resultat1.bgColor).toBe(resultat2.bgColor);
      });

      it("skal gi samme resultat for alle permutasjoner", () => {
        const aktiviteter = [
          [{ type: AKTIVITET_TYPE.Fravaer }, { type: AKTIVITET_TYPE.Utdanning }],
          [{ type: AKTIVITET_TYPE.Utdanning }, { type: AKTIVITET_TYPE.Fravaer }],
        ];

        const resultater = aktiviteter.map((a) => getActivityClasses(a));

        expect(resultater[0].datoColor).toBe(resultater[1].datoColor);
        expect(resultater[0].bgColor).toBe(resultater[1].bgColor);
      });
    });
  });

  describe("getActivityDotColor", () => {
    describe("gyldige aktivitetstyper", () => {
      it("skal returnere dotColor for Arbeid", () => {
        const result = getActivityDotColor(AKTIVITET_TYPE.Arbeid);

        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("skal returnere dotColor for Syk", () => {
        const result = getActivityDotColor(AKTIVITET_TYPE.Syk);

        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("skal returnere dotColor for Fravaer", () => {
        const result = getActivityDotColor(AKTIVITET_TYPE.Fravaer);

        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("skal returnere dotColor for Utdanning", () => {
        const result = getActivityDotColor(AKTIVITET_TYPE.Utdanning);

        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });

      it("skal returnere ulike farger for forskjellige aktivitetstyper", () => {
        const arbeidColor = getActivityDotColor(AKTIVITET_TYPE.Arbeid);
        const sykColor = getActivityDotColor(AKTIVITET_TYPE.Syk);
        const fravaerColor = getActivityDotColor(AKTIVITET_TYPE.Fravaer);
        const utdanningColor = getActivityDotColor(AKTIVITET_TYPE.Utdanning);

        const colors = [arbeidColor, sykColor, fravaerColor, utdanningColor];
        const uniqueColors = new Set(colors);

        expect(uniqueColors.size).toBe(4);
      });
    });

    describe("ugyldige aktivitetstyper", () => {
      it("skal returnere tom streng for ukjent type", () => {
        const result = getActivityDotColor("UkjentType");

        expect(result).toBe("");
      });

      it("skal returnere tom streng for tom streng", () => {
        const result = getActivityDotColor("");

        expect(result).toBe("");
      });
    });

    describe("konsistens", () => {
      it("skal returnere samme farge for samme type hver gang", () => {
        const result1 = getActivityDotColor(AKTIVITET_TYPE.Arbeid);
        const result2 = getActivityDotColor(AKTIVITET_TYPE.Arbeid);
        const result3 = getActivityDotColor(AKTIVITET_TYPE.Arbeid);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });

  describe("integrasjon mellom funksjoner", () => {
    it("skal returnere konsistente farger på tvers av funksjoner", () => {
      // getActivityClasses bruker samme AKTIVITET_KLASSER som getActivityDotColor
      const classes = getActivityClasses([{ type: AKTIVITET_TYPE.Arbeid }]);
      const dotColor = getActivityDotColor(AKTIVITET_TYPE.Arbeid);

      // Begge skal returnere truthy verdier for samme aktivitetstype
      expect(classes.datoColor).toBeTruthy();
      expect(classes.bgColor).toBeTruthy();
      expect(dotColor).toBeTruthy();
    });

    it("skal håndtere alle aktivitetstyper på samme måte", () => {
      const typer = [
        AKTIVITET_TYPE.Arbeid,
        AKTIVITET_TYPE.Syk,
        AKTIVITET_TYPE.Fravaer,
        AKTIVITET_TYPE.Utdanning,
      ];

      typer.forEach((type) => {
        const classes = getActivityClasses([{ type }]);
        const dotColor = getActivityDotColor(type);

        expect(classes.datoColor).toBeTruthy();
        expect(classes.bgColor).toBeTruthy();
        expect(dotColor).toBeTruthy();
      });
    });
  });
});
