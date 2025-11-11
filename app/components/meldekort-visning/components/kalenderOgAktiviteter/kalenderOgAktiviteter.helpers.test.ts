import { describe, expect, it } from "vitest";

import {
  AKTIVITET_TYPE,
  MELDEKORT_TYPE,
  OPPRETTET_AV,
  RAPPORTERINGSPERIODE_STATUS,
} from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { beregnTotalt } from "./kalenderOgAktiviteter.helpers";

describe("kalenderOgAktiviteter.helpers", () => {
  const basePeriode: IRapporteringsperiode = {
    id: "test-1",
    ident: "12345678901",
    type: MELDEKORT_TYPE.ORDINAERT,
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [],
    kanSendes: false,
    kanEndres: false,
    kanSendesFra: "2024-01-14T00:00:00",
    sisteFristForTrekk: null,
    status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
    opprettetAv: OPPRETTET_AV.Dagpenger,
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
  };

  describe("beregnTotalt", () => {
    it("skal returnere 0 for periode uten dager", () => {
      const result = beregnTotalt(basePeriode, AKTIVITET_TYPE.Arbeid);
      expect(result).toBe(0);
    });

    it("skal returnere 0 for aktivitetstype som ikke finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        dager: [
          {
            type: "UKJENT",
            dagIndex: 0,
            dato: "2024-01-01",
            aktiviteter: [{ type: "Syk", dato: "2024-01-01" }],
          },
        ],
      };

      const result = beregnTotalt(periode, AKTIVITET_TYPE.Arbeid);
      expect(result).toBe(0);
    });

    describe("Arbeid", () => {
      it("skal beregne totalt antall timer for arbeid", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Arbeid", dato: "2024-01-01", timer: "PT7H30M" }],
            },
            {
              type: "UKJENT",
              dagIndex: 1,
              dato: "2024-01-02",
              aktiviteter: [{ type: "Arbeid", dato: "2024-01-02", timer: "PT5H" }],
            },
            {
              type: "UKJENT",
              dagIndex: 2,
              dato: "2024-01-03",
              aktiviteter: [{ type: "Arbeid", dato: "2024-01-03", timer: "PT8H" }],
            },
          ],
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Arbeid);
        expect(result).toBe(20.5); // 7.5 + 5 + 8 = 20.5
      });

      it("skal håndtere arbeid uten timer (PT0H)", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Arbeid", dato: "2024-01-01" }],
            },
          ],
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Arbeid);
        expect(result).toBe(0);
      });

      it("skal summere timer fra flere dager", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: Array.from({ length: 5 }, (_, i) => ({
            type: "UKJENT" as const,
            dagIndex: i,
            dato: `2024-01-${String(i + 1).padStart(2, "0")}`,
            aktiviteter: [
              {
                type: "Arbeid",
                dato: `2024-01-${String(i + 1).padStart(2, "0")}`,
                timer: "PT7H30M",
              },
            ],
          })),
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Arbeid);
        expect(result).toBe(37.5); // 5 dager × 7.5 timer = 37.5
      });
    });

    describe("Andre aktiviteter (dager)", () => {
      it("skal telle antall dager med syk-aktivitet", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Syk", dato: "2024-01-01" }],
            },
            {
              type: "UKJENT",
              dagIndex: 1,
              dato: "2024-01-02",
              aktiviteter: [{ type: "Syk", dato: "2024-01-02" }],
            },
            {
              type: "UKJENT",
              dagIndex: 2,
              dato: "2024-01-03",
              aktiviteter: [{ type: "Syk", dato: "2024-01-03" }],
            },
          ],
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Syk);
        expect(result).toBe(3);
      });

      it("skal telle antall dager med fravær", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Fravaer", dato: "2024-01-01" }],
            },
            {
              type: "UKJENT",
              dagIndex: 1,
              dato: "2024-01-02",
              aktiviteter: [{ type: "Fravaer", dato: "2024-01-02" }],
            },
          ],
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Fravaer);
        expect(result).toBe(2);
      });

      it("skal telle antall dager med utdanning", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Utdanning", dato: "2024-01-01" }],
            },
          ],
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Utdanning);
        expect(result).toBe(1);
      });
    });

    describe("Blandede aktiviteter", () => {
      it("skal kun telle spesifikk aktivitetstype når flere finnes på samme dag", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [
                { type: "Arbeid", dato: "2024-01-01", timer: "PT4H" },
                { type: "Syk", dato: "2024-01-01" },
              ],
            },
            {
              type: "UKJENT",
              dagIndex: 1,
              dato: "2024-01-02",
              aktiviteter: [{ type: "Syk", dato: "2024-01-02" }],
            },
          ],
        };

        const arbeidTimer = beregnTotalt(periode, AKTIVITET_TYPE.Arbeid);
        const sykDager = beregnTotalt(periode, AKTIVITET_TYPE.Syk);

        expect(arbeidTimer).toBe(4);
        expect(sykDager).toBe(2);
      });

      it("skal ignorere dager uten den spesifikke aktiviteten", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Arbeid", dato: "2024-01-01", timer: "PT7H30M" }],
            },
            {
              type: "UKJENT",
              dagIndex: 1,
              dato: "2024-01-02",
              aktiviteter: [{ type: "Syk", dato: "2024-01-02" }],
            },
            {
              type: "UKJENT",
              dagIndex: 2,
              dato: "2024-01-03",
              aktiviteter: [],
            },
          ],
        };

        const sykDager = beregnTotalt(periode, AKTIVITET_TYPE.Syk);
        expect(sykDager).toBe(1);
      });
    });

    describe("Edge cases", () => {
      it("skal håndtere periode med bare tomme dager", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: Array.from({ length: 14 }, (_, i) => ({
            type: "UKJENT" as const,
            dagIndex: i,
            dato: `2024-01-${String(i + 1).padStart(2, "0")}`,
            aktiviteter: [],
          })),
        };

        const result = beregnTotalt(periode, AKTIVITET_TYPE.Arbeid);
        expect(result).toBe(0);
      });

      it("skal returnere 0 for ukjent aktivitetstype", () => {
        const periode: IRapporteringsperiode = {
          ...basePeriode,
          dager: [
            {
              type: "UKJENT",
              dagIndex: 0,
              dato: "2024-01-01",
              aktiviteter: [{ type: "Arbeid", dato: "2024-01-01", timer: "PT7H30M" }],
            },
          ],
        };

        const result = beregnTotalt(periode, "UKJENT_TYPE");
        expect(result).toBe(0);
      });
    });
  });
});
