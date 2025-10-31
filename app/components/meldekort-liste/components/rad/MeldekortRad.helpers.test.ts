import { describe, expect, it } from "vitest";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import {
  erPeriodeKorrigert,
  erPeriodeOpprettet,
  getStatusConfig,
  HIGHLIGHT_DURATION_MS,
  skalViseInnsendtInfo,
} from "./MeldekortRad.helpers";

describe("MeldekortRad.helpers", () => {
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

  describe("HIGHLIGHT_DURATION_MS", () => {
    it("skal være definert som en konstant", () => {
      expect(HIGHLIGHT_DURATION_MS).toBe(3600);
    });
  });

  describe("getStatusConfig", () => {
    it("skal returnere 'Innsendt' status for innsendt periode", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      };

      const result = getStatusConfig(periode);

      expect(result).toEqual({
        text: "Innsendt",
        variant: "success",
      });
    });

    it("skal returnere 'Klar til utfylling' når kanSendes er true", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: true,
        status: "TilUtfylling",
      };

      const result = getStatusConfig(periode);

      expect(result).toEqual({
        text: "Klar til utfylling",
        variant: "info",
      });
    });

    it("skal returnere 'Meldekort opprettet' for ikke-innsendt periode som ikke kan sendes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: false,
        status: "TilUtfylling",
      };

      const result = getStatusConfig(periode);

      expect(result).toEqual({
        text: "Meldekort opprettet",
        variant: "info",
      });
    });
  });

  describe("erPeriodeOpprettet", () => {
    it("skal returnere true for periode som ikke er innsendt og ikke kan sendes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: "TilUtfylling",
        kanSendes: false,
      };

      expect(erPeriodeOpprettet(periode)).toBe(true);
    });

    it("skal returnere false for innsendt periode", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        kanSendes: false,
      };

      expect(erPeriodeOpprettet(periode)).toBe(false);
    });

    it("skal returnere false for periode som kan sendes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: "TilUtfylling",
        kanSendes: true,
      };

      expect(erPeriodeOpprettet(periode)).toBe(false);
    });

    it("skal returnere false for innsendt periode som kan sendes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        kanSendes: true,
      };

      expect(erPeriodeOpprettet(periode)).toBe(false);
    });
  });

  describe("erPeriodeKorrigert", () => {
    it("skal returnere true når originalMeldekortId finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        originalMeldekortId: "original-123",
      };

      expect(erPeriodeKorrigert(periode)).toBe(true);
    });

    it("skal returnere false når originalMeldekortId er null", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        originalMeldekortId: null,
      };

      expect(erPeriodeKorrigert(periode)).toBe(false);
    });
  });

  describe("skalViseInnsendtInfo", () => {
    it("skal returnere true når periode er innsendt med innsendtTidspunkt og meldedato", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        innsendtTidspunkt: "2024-01-15T10:00:00",
        meldedato: "2024-01-15",
      };

      expect(skalViseInnsendtInfo(periode)).toBe(true);
    });

    it("skal returnere false når periode ikke er innsendt", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: "TilUtfylling",
        innsendtTidspunkt: "2024-01-15T10:00:00",
        meldedato: "2024-01-15",
      };

      expect(skalViseInnsendtInfo(periode)).toBe(false);
    });

    it("skal returnere false når innsendtTidspunkt mangler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        innsendtTidspunkt: null,
        meldedato: "2024-01-15",
      };

      expect(skalViseInnsendtInfo(periode)).toBe(false);
    });

    it("skal returnere false når meldedato mangler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        innsendtTidspunkt: "2024-01-15T10:00:00",
        meldedato: null,
      };

      expect(skalViseInnsendtInfo(periode)).toBe(false);
    });

    it("skal returnere false når både innsendtTidspunkt og meldedato mangler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        innsendtTidspunkt: null,
        meldedato: null,
      };

      expect(skalViseInnsendtInfo(periode)).toBe(false);
    });
  });
});
