import { describe, expect, it } from "vitest";

import { AKTIVITET_TYPE } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { groupPeriodsByYear, sorterAktiviteter, unikeAktiviteter } from "./utils";

describe("meldekort-liste utils", () => {
  const basePeriode: IRapporteringsperiode = {
    id: "test-1",
    ident: "12345678901",
    type: "meldekort",
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [],
    kanSendes: false,
    kanEndres: false,
    kanSendesFra: "2024-01-14T00:00:00",
    sisteFristForTrekk: null,
    status: "TilUtfylling",
    opprettetAv: "Dagpenger",
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
  };

  describe("unikeAktiviteter", () => {
    it("skal returnere tom array når periode har ingen dager", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [],
      };

      expect(unikeAktiviteter(periode)).toEqual([]);
    });

    it("skal returnere tom array når dager har ingen aktiviteter", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "dag",
            dato: "2024-01-01",
            aktiviteter: [],
            dagIndex: 0,
          },
          {
            type: "dag",
            dato: "2024-01-02",
            aktiviteter: [],
            dagIndex: 1,
          },
        ],
      };

      expect(unikeAktiviteter(periode)).toEqual([]);
    });

    it("skal returnere unik aktivitet når alle dager har samme aktivitet", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "dag",
            dato: "2024-01-01",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "PT7H30M" }],
            dagIndex: 0,
          },
          {
            type: "dag",
            dato: "2024-01-02",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "PT8H" }],
            dagIndex: 1,
          },
        ],
      };

      const result = unikeAktiviteter(periode);
      expect(result).toHaveLength(1);
      expect(result).toContain(AKTIVITET_TYPE.Arbeid);
    });

    it("skal returnere alle ulike aktiviteter på tvers av dager", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "dag",
            dato: "2024-01-01",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "PT7H30M" }],
            dagIndex: 0,
          },
          {
            type: "dag",
            dato: "2024-01-02",
            aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
            dagIndex: 1,
          },
          {
            type: "dag",
            dato: "2024-01-03",
            aktiviteter: [{ type: AKTIVITET_TYPE.Fravaer, dato: "2024-01-03" }],
            dagIndex: 2,
          },
          {
            type: "dag",
            dato: "2024-01-04",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-04", timer: "PT8H" }],
            dagIndex: 3,
          },
        ],
      };

      const result = unikeAktiviteter(periode);
      expect(result).toHaveLength(3);
      expect(result).toContain(AKTIVITET_TYPE.Arbeid);
      expect(result).toContain(AKTIVITET_TYPE.Syk);
      expect(result).toContain(AKTIVITET_TYPE.Fravaer);
    });

    it("skal returnere unike aktiviteter selv når dag har flere aktiviteter", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "dag",
            dato: "2024-01-01",
            aktiviteter: [
              { type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "PT4H" },
              { type: AKTIVITET_TYPE.Utdanning, dato: "2024-01-01" },
            ],
            dagIndex: 0,
          },
          {
            type: "dag",
            dato: "2024-01-02",
            aktiviteter: [
              { type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "PT8H" },
              { type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" },
            ],
            dagIndex: 1,
          },
        ],
      };

      const result = unikeAktiviteter(periode);
      expect(result).toHaveLength(3);
      expect(result).toContain(AKTIVITET_TYPE.Arbeid);
      expect(result).toContain(AKTIVITET_TYPE.Utdanning);
      expect(result).toContain(AKTIVITET_TYPE.Syk);
    });

    it("skal håndtere duplikater korrekt med Set", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "dag",
            dato: "2024-01-01",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "PT7H" }],
            dagIndex: 0,
          },
          {
            type: "dag",
            dato: "2024-01-02",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-02", timer: "PT8H" }],
            dagIndex: 1,
          },
          {
            type: "dag",
            dato: "2024-01-03",
            aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-03", timer: "PT6H" }],
            dagIndex: 2,
          },
        ],
      };

      const result = unikeAktiviteter(periode);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(AKTIVITET_TYPE.Arbeid);
    });
  });

  describe("sorterAktiviteter", () => {
    it("skal returnere tom array når input er tom", () => {
      expect(sorterAktiviteter([])).toEqual([]);
    });

    it("skal returnere samme array når det er bare én aktivitet", () => {
      const aktiviteter = [AKTIVITET_TYPE.Arbeid];
      expect(sorterAktiviteter(aktiviteter)).toEqual([AKTIVITET_TYPE.Arbeid]);
    });

    it("skal sortere aktiviteter i riktig rekkefølge", () => {
      const aktiviteter = [
        AKTIVITET_TYPE.Utdanning,
        AKTIVITET_TYPE.Arbeid,
        AKTIVITET_TYPE.Fravaer,
        AKTIVITET_TYPE.Syk,
      ];

      const result = sorterAktiviteter(aktiviteter);

      expect(result).toEqual([
        AKTIVITET_TYPE.Arbeid,
        AKTIVITET_TYPE.Syk,
        AKTIVITET_TYPE.Fravaer,
        AKTIVITET_TYPE.Utdanning,
      ]);
    });

    it("skal sortere aktiviteter når de er i omvendt rekkefølge", () => {
      const aktiviteter = [
        AKTIVITET_TYPE.Utdanning,
        AKTIVITET_TYPE.Fravaer,
        AKTIVITET_TYPE.Syk,
        AKTIVITET_TYPE.Arbeid,
      ];

      const result = sorterAktiviteter(aktiviteter);

      expect(result).toEqual([
        AKTIVITET_TYPE.Arbeid,
        AKTIVITET_TYPE.Syk,
        AKTIVITET_TYPE.Fravaer,
        AKTIVITET_TYPE.Utdanning,
      ]);
    });

    it("skal sortere aktiviteter når bare to aktiviteter finnes", () => {
      const aktiviteter = [AKTIVITET_TYPE.Syk, AKTIVITET_TYPE.Arbeid];

      const result = sorterAktiviteter(aktiviteter);

      expect(result).toEqual([AKTIVITET_TYPE.Arbeid, AKTIVITET_TYPE.Syk]);
    });

    it("skal håndtere når alle aktiviteter er samme type", () => {
      const aktiviteter = [AKTIVITET_TYPE.Arbeid];

      const result = sorterAktiviteter(aktiviteter);

      expect(result).toEqual([AKTIVITET_TYPE.Arbeid]);
    });

    it("skal sortere korrekt når aktiviteter mangler mellomliggende typer", () => {
      const aktiviteter = [AKTIVITET_TYPE.Utdanning, AKTIVITET_TYPE.Arbeid];

      const result = sorterAktiviteter(aktiviteter);

      expect(result).toEqual([AKTIVITET_TYPE.Arbeid, AKTIVITET_TYPE.Utdanning]);
    });
  });

  describe("groupPeriodsByYear", () => {
    it("skal returnere tomt objekt når input er tom array", () => {
      expect(groupPeriodsByYear([])).toEqual({});
    });

    it("skal gruppere én periode etter år", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "2024-1",
          periode: {
            fraOgMed: "2024-01-01",
            tilOgMed: "2024-01-14",
          },
        },
      ];

      const result = groupPeriodsByYear(perioder);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result[2024]).toHaveLength(1);
      expect(result[2024][0].id).toBe("2024-1");
    });

    it("skal gruppere flere perioder fra samme år", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "2024-1",
          periode: {
            fraOgMed: "2024-01-01",
            tilOgMed: "2024-01-14",
          },
        },
        {
          ...basePeriode,
          id: "2024-2",
          periode: {
            fraOgMed: "2024-02-01",
            tilOgMed: "2024-02-14",
          },
        },
        {
          ...basePeriode,
          id: "2024-3",
          periode: {
            fraOgMed: "2024-12-01",
            tilOgMed: "2024-12-14",
          },
        },
      ];

      const result = groupPeriodsByYear(perioder);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result[2024]).toHaveLength(3);
      expect(result[2024].map((p) => p.id)).toEqual(["2024-1", "2024-2", "2024-3"]);
    });

    it("skal gruppere perioder fra forskjellige år separat", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "2023-1",
          periode: {
            fraOgMed: "2023-01-01",
            tilOgMed: "2023-01-14",
          },
        },
        {
          ...basePeriode,
          id: "2024-1",
          periode: {
            fraOgMed: "2024-01-01",
            tilOgMed: "2024-01-14",
          },
        },
        {
          ...basePeriode,
          id: "2024-2",
          periode: {
            fraOgMed: "2024-06-01",
            tilOgMed: "2024-06-14",
          },
        },
        {
          ...basePeriode,
          id: "2025-1",
          periode: {
            fraOgMed: "2025-01-01",
            tilOgMed: "2025-01-14",
          },
        },
      ];

      const result = groupPeriodsByYear(perioder);

      expect(Object.keys(result)).toHaveLength(3);
      expect(result[2023]).toHaveLength(1);
      expect(result[2024]).toHaveLength(2);
      expect(result[2025]).toHaveLength(1);
      expect(result[2023][0].id).toBe("2023-1");
      expect(result[2024].map((p) => p.id)).toEqual(["2024-1", "2024-2"]);
      expect(result[2025][0].id).toBe("2025-1");
    });

    it("skal bruke fraOgMed-dato for å bestemme år", () => {
      const perioder: IRapporteringsperiode[] = [
        {
          ...basePeriode,
          id: "spanning-2023-2024",
          periode: {
            fraOgMed: "2023-12-25",
            tilOgMed: "2024-01-07",
          },
        },
      ];

      const result = groupPeriodsByYear(perioder);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result[2023]).toBeDefined();
      expect(result[2023]).toHaveLength(1);
      expect(result[2024]).toBeUndefined();
    });

    it("skal håndtere mange perioder på tvers av flere år", () => {
      const perioder: IRapporteringsperiode[] = [];
      for (let year = 2020; year <= 2024; year++) {
        for (let month = 1; month <= 12; month++) {
          perioder.push({
            ...basePeriode,
            id: `${year}-${month}`,
            periode: {
              fraOgMed: `${year}-${String(month).padStart(2, "0")}-01`,
              tilOgMed: `${year}-${String(month).padStart(2, "0")}-14`,
            },
          });
        }
      }

      const result = groupPeriodsByYear(perioder);

      expect(Object.keys(result)).toHaveLength(5);
      expect(result[2020]).toHaveLength(12);
      expect(result[2021]).toHaveLength(12);
      expect(result[2022]).toHaveLength(12);
      expect(result[2023]).toHaveLength(12);
      expect(result[2024]).toHaveLength(12);
    });
  });
});
