import { describe, expect, it } from "vitest";

import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import {
  erPeriodeKorrigert,
  erPeriodeOpprettet,
  formaterPeriodeDatoer,
  getStatusConfig,
  HIGHLIGHT_DURATION_MS,
  periodeHarKorrigering,
  skalViseInnsendtInfo,
} from "./MeldekortRad.helpers";

describe("MeldekortRad.helpers", () => {
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
        variant: "info",
      });
    });

    it("skal returnere 'Klar til utfylling' når kanSendes er true", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanSendes: true,
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
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
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
      };

      const result = getStatusConfig(periode);

      expect(result).toEqual({
        text: "Meldekort opprettet",
        variant: "neutral",
      });
    });
  });

  describe("erPeriodeOpprettet", () => {
    it("skal returnere true for periode som ikke er innsendt og ikke kan sendes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
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
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
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
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
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

  describe("periodeHarKorrigering", () => {
    it("skal returnere true når en annen periode har denne perioden som originalMeldekortId", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        id: "original-123",
      };

      const korrigeringsPeriode: IRapporteringsperiode = {
        ...basePeriode,
        id: "korrigering-456",
        originalMeldekortId: "original-123",
      };

      const allePerioder = [periode, korrigeringsPeriode];

      expect(periodeHarKorrigering(periode, allePerioder)).toBe(true);
    });

    it("skal returnere false når ingen andre perioder refererer til denne perioden", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        id: "original-123",
      };

      const annenPeriode: IRapporteringsperiode = {
        ...basePeriode,
        id: "annen-456",
        originalMeldekortId: null,
      };

      const allePerioder = [periode, annenPeriode];

      expect(periodeHarKorrigering(periode, allePerioder)).toBe(false);
    });

    it("skal returnere false når perioden selv er en korrigering", () => {
      const originalPeriode: IRapporteringsperiode = {
        ...basePeriode,
        id: "original-123",
      };

      const korrigeringsPeriode: IRapporteringsperiode = {
        ...basePeriode,
        id: "korrigering-456",
        originalMeldekortId: "original-123",
      };

      const allePerioder = [originalPeriode, korrigeringsPeriode];

      expect(periodeHarKorrigering(korrigeringsPeriode, allePerioder)).toBe(false);
    });

    it("skal returnere false når allePerioder er tom array", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        id: "original-123",
      };

      expect(periodeHarKorrigering(periode, [])).toBe(false);
    });

    it("skal håndtere multiple korrigeringer og kun returnere true hvis noen refererer til perioden", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        id: "original-123",
      };

      const korrigering1: IRapporteringsperiode = {
        ...basePeriode,
        id: "korrigering-1",
        originalMeldekortId: "original-123",
      };

      const korrigering2: IRapporteringsperiode = {
        ...basePeriode,
        id: "korrigering-2",
        originalMeldekortId: "korrigering-1",
      };

      const allePerioder = [periode, korrigering1, korrigering2];

      expect(periodeHarKorrigering(periode, allePerioder)).toBe(true);
    });
  });

  describe("formaterPeriodeDatoer", () => {
    const mockFormatterDato = ({ dato }: { dato: string }) => {
      // Enkel mock som returnerer datoen i et standardformat
      return new Date(dato).toLocaleDateString("nb-NO");
    };

    it("skal formatere periode-datoer med bindestrek i mellom", () => {
      const result = formaterPeriodeDatoer("2024-01-01", "2024-01-14", mockFormatterDato);

      expect(result).toBe("1.1.2024 - 14.1.2024");
    });

    it("skal håndtere ulike datoformater", () => {
      const result = formaterPeriodeDatoer("2024-12-16", "2024-12-29", mockFormatterDato);

      expect(result).toBe("16.12.2024 - 29.12.2024");
    });

    it("skal bruke den gitte formatterDato funksjonen", () => {
      const customFormatter = ({ dato }: { dato: string }) => {
        return dato; // Returnerer raw dato
      };

      const result = formaterPeriodeDatoer("2024-01-01", "2024-01-14", customFormatter);

      expect(result).toBe("2024-01-01 - 2024-01-14");
    });
  });
});
