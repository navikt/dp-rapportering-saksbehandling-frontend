import { describe, expect, it } from "vitest";

import { ANSVARLIG_SYSTEM, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { erPeriodeTilUtfylling, kanMeldekortSendes } from "./MeldekortVisning.helpers";

describe("MeldekortVisning.helpers", () => {
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

  describe("erPeriodeTilUtfylling", () => {
    it("skal returnere true når status er TilUtfylling", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
      };

      expect(erPeriodeTilUtfylling(periode)).toBe(true);
    });

    it("skal returnere false når status er Innsendt", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      };

      expect(erPeriodeTilUtfylling(periode)).toBe(false);
    });

    it("skal returnere false for ugyldige statuser (defensive programming)", () => {
      // I praksis skal dette ikke skje pga TypeScript, men tester likevel
      // Type assertion er bevisst brukt her for å teste runtime-oppførsel
      const periode = {
        ...basePeriode,
        status: "UkjentStatus",
      } as unknown as IRapporteringsperiode;

      expect(erPeriodeTilUtfylling(periode)).toBe(false);
    });
  });

  describe("kanMeldekortSendes", () => {
    it("skal returnere true når kanSendes er true og ansvarlig system er DP", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: true,
      };

      expect(kanMeldekortSendes(periode, ANSVARLIG_SYSTEM.DP)).toBe(true);
    });

    it("skal returnere false når kanSendes er false", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: false,
      };

      expect(kanMeldekortSendes(periode, ANSVARLIG_SYSTEM.DP)).toBe(false);
    });

    it("skal returnere false når ansvarlig system ikke er DP", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: true,
      };

      expect(kanMeldekortSendes(periode, ANSVARLIG_SYSTEM.ARENA)).toBe(false);
    });

    it("skal returnere false når begge betingelser er false", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: false,
      };

      expect(kanMeldekortSendes(periode, ANSVARLIG_SYSTEM.ARENA)).toBe(false);
    });
  });
});
