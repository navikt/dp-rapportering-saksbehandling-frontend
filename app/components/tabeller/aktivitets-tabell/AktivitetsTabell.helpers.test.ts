import { describe, expect, it } from "vitest";

import { AKTIVITET_TYPE } from "~/utils/constants";

import type { IKorrigertDag } from "../../../utils/korrigering.utils";
import {
  beregnTotalBeløp,
  beregnTotaltAntallDager,
  beregnTotaltAntallTimer,
  formaterDesimalNorsk,
  formaterTotalBeløp,
  lagAktivitetKlassenavn,
  pluraliserEnhet,
} from "./AktivitetsTabell.helpers";

describe("AktivitetsTabell.helpers", () => {
  const baseDag: IKorrigertDag = {
    type: "dag",
    dato: "2024-01-01",
    dagIndex: 0,
    aktiviteter: [],
  };

  describe("beregnTotaltAntallTimer", () => {
    it("skal returnere 0 når ingen dager har arbeidstimer", () => {
      const dager: IKorrigertDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
        { ...baseDag, dato: "2024-01-02", aktiviteter: [] },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(0);
    });

    it("skal beregne totalt antall timer korrekt", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "8" }],
        },
        {
          ...baseDag,
          dato: "2024-01-03",
          aktiviteter: [{ id: "3", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-03", timer: "4.5" }],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(20);
    });

    it("skal håndtere tom timer-streng som 0", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "" }],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(0);
    });

    it("skal håndtere ugyldig timer-streng som 0", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [
            { id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "ugyldig" },
          ],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(0);
    });

    it("skal ignorere andre aktivitetstyper", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [
            { id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7" },
            { id: "2", type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" },
          ],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(7);
    });

    it("skal returnere 0 for ikke-arbeid aktiviteter", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Syk)).toBe(0);
    });

    it("skal håndtere timer med komma som desimalskilletegn", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "2,5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "7,5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-03",
          aktiviteter: [{ id: "3", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-03", timer: "4" }],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(14);
    });

    it("skal håndtere blanding av komma og punktum som desimalskilletegn", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "2,5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "7.5" }],
        },
      ];

      expect(beregnTotaltAntallTimer(dager, AKTIVITET_TYPE.Arbeid)).toBe(10);
    });
  });

  describe("beregnTotaltAntallDager", () => {
    it("skal returnere 0 når ingen dager har aktiviteten", () => {
      const dager: IKorrigertDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
        { ...baseDag, dato: "2024-01-02", aktiviteter: [] },
      ];

      expect(beregnTotaltAntallDager(dager, AKTIVITET_TYPE.Syk)).toBe(0);
    });

    it("skal telle antall dager med aktiviteten", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Fravaer, dato: "2024-01-02" }],
        },
        {
          ...baseDag,
          dato: "2024-01-03",
          aktiviteter: [{ id: "3", type: AKTIVITET_TYPE.Syk, dato: "2024-01-03" }],
        },
      ];

      expect(beregnTotaltAntallDager(dager, AKTIVITET_TYPE.Syk)).toBe(2);
    });

    it("skal telle dag kun én gang selv med flere aktiviteter", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [
            { id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "4" },
            { id: "2", type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" },
          ],
        },
      ];

      expect(beregnTotaltAntallDager(dager, AKTIVITET_TYPE.Syk)).toBe(1);
    });

    it("skal returnere riktig antall for alle aktivitetstyper", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Utdanning, dato: "2024-01-01" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Utdanning, dato: "2024-01-02" }],
        },
        {
          ...baseDag,
          dato: "2024-01-03",
          aktiviteter: [{ id: "3", type: AKTIVITET_TYPE.Utdanning, dato: "2024-01-03" }],
        },
      ];

      expect(beregnTotaltAntallDager(dager, AKTIVITET_TYPE.Utdanning)).toBe(3);
    });
  });

  describe("formaterDesimalNorsk", () => {
    it("skal formatere desimaltall med komma", () => {
      expect(formaterDesimalNorsk(7.5)).toBe("7,5");
    });

    it("skal håndtere hele tall", () => {
      expect(formaterDesimalNorsk(8)).toBe("8");
    });

    it("skal håndtere 0", () => {
      expect(formaterDesimalNorsk(0)).toBe("0");
    });

    it("skal håndtere flere desimaler", () => {
      expect(formaterDesimalNorsk(12.75)).toBe("12,75");
    });

    it("skal håndtere negative tall", () => {
      expect(formaterDesimalNorsk(-5.5)).toBe("-5,5");
    });
  });

  describe("pluraliserEnhet", () => {
    it("skal returnere 'timer' for arbeid uavhengig av antall", () => {
      expect(pluraliserEnhet(0, AKTIVITET_TYPE.Arbeid)).toBe("timer");
      expect(pluraliserEnhet(1, AKTIVITET_TYPE.Arbeid)).toBe("timer");
      expect(pluraliserEnhet(7.5, AKTIVITET_TYPE.Arbeid)).toBe("timer");
      expect(pluraliserEnhet(100, AKTIVITET_TYPE.Arbeid)).toBe("timer");
    });

    it("skal returnere 'dag' for 1 dag", () => {
      expect(pluraliserEnhet(1, AKTIVITET_TYPE.Syk)).toBe("dag");
      expect(pluraliserEnhet(1, AKTIVITET_TYPE.Fravaer)).toBe("dag");
      expect(pluraliserEnhet(1, AKTIVITET_TYPE.Utdanning)).toBe("dag");
    });

    it("skal returnere 'dager' for 0 dager", () => {
      expect(pluraliserEnhet(0, AKTIVITET_TYPE.Syk)).toBe("dager");
    });

    it("skal returnere 'dager' for flere dager", () => {
      expect(pluraliserEnhet(2, AKTIVITET_TYPE.Syk)).toBe("dager");
      expect(pluraliserEnhet(5, AKTIVITET_TYPE.Fravaer)).toBe("dager");
      expect(pluraliserEnhet(10, AKTIVITET_TYPE.Utdanning)).toBe("dager");
    });
  });

  describe("lagAktivitetKlassenavn", () => {
    it("skal generere klassenavn med kapitalisert aktivitetstype", () => {
      expect(lagAktivitetKlassenavn("arbeid", "trHover")).toBe("trHoverArbeid");
      expect(lagAktivitetKlassenavn("syk", "aktivitet")).toBe("aktivitetSyk");
      expect(lagAktivitetKlassenavn("fravaer", "trHover")).toBe("trHoverFravaer");
      expect(lagAktivitetKlassenavn("utdanning", "aktivitet")).toBe("aktivitetUtdanning");
    });

    it("skal håndtere allerede kapitaliserte ord", () => {
      expect(lagAktivitetKlassenavn("Arbeid", "trHover")).toBe("trHoverArbeid");
    });

    it("skal håndtere tom prefix", () => {
      expect(lagAktivitetKlassenavn("arbeid", "")).toBe("Arbeid");
    });
  });

  describe("beregnTotalBeløp", () => {
    it("skal returnere timer for arbeid", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "8" }],
        },
      ];

      expect(beregnTotalBeløp(dager, AKTIVITET_TYPE.Arbeid)).toBe(15.5);
    });

    it("skal returnere antall dager for andre aktiviteter", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
        },
      ];

      expect(beregnTotalBeløp(dager, AKTIVITET_TYPE.Syk)).toBe(2);
    });
  });

  describe("formaterTotalBeløp", () => {
    it("skal formatere timer med norsk desimalformat", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
      ];

      expect(formaterTotalBeløp(dager, AKTIVITET_TYPE.Arbeid)).toBe("7,5");
    });

    it("skal returnere antall dager som string for andre aktiviteter", () => {
      const dager: IKorrigertDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          aktiviteter: [{ id: "2", type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
        },
      ];

      expect(formaterTotalBeløp(dager, AKTIVITET_TYPE.Syk)).toBe("2");
    });

    it("skal håndtere 0 korrekt", () => {
      const dager: IKorrigertDag[] = [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }];

      expect(formaterTotalBeløp(dager, AKTIVITET_TYPE.Arbeid)).toBe("0");
      expect(formaterTotalBeløp(dager, AKTIVITET_TYPE.Syk)).toBe("0");
    });
  });
});
