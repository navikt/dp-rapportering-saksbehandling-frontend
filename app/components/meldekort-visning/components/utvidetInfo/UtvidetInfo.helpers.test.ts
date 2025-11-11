import { describe, expect, it } from "vitest";

import {
  ANSVARLIG_SYSTEM,
  MELDEKORT_TYPE,
  OPPRETTET_AV,
  RAPPORTERINGSPERIODE_STATUS,
  ROLLE,
} from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import {
  erKildeSaksbehandler,
  erMeldekortKorrigert,
  kanMeldekortEndres,
  pluraliserDager,
} from "./UtvidetInfo.helpers";

describe("UtvidetInfo.helpers", () => {
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

  describe("kanMeldekortEndres", () => {
    it("skal returnere true når periode kan endres og ansvarlig system er DP", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: true,
      };

      expect(kanMeldekortEndres(periode, ANSVARLIG_SYSTEM.DP)).toBe(true);
    });

    it("skal returnere false når periode ikke kan endres", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: false,
      };

      expect(kanMeldekortEndres(periode, ANSVARLIG_SYSTEM.DP)).toBe(false);
    });

    it("skal returnere false når ansvarlig system ikke er DP", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: true,
      };

      expect(kanMeldekortEndres(periode, ANSVARLIG_SYSTEM.ARENA)).toBe(false);
    });

    it("skal returnere false når begge betingelser er false", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: false,
      };

      expect(kanMeldekortEndres(periode, ANSVARLIG_SYSTEM.ARENA)).toBe(false);
    });
  });

  describe("erMeldekortKorrigert", () => {
    it("skal returnere true når originalMeldekortId finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        originalMeldekortId: "original-123",
      };

      expect(erMeldekortKorrigert(periode)).toBe(true);
    });

    it("skal returnere false når originalMeldekortId er null", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        originalMeldekortId: null,
      };

      expect(erMeldekortKorrigert(periode)).toBe(false);
    });

    it("skal returnere false når originalMeldekortId er undefined", () => {
      const periode = {
        ...basePeriode,
        originalMeldekortId: undefined,
      } as unknown as IRapporteringsperiode;

      expect(erMeldekortKorrigert(periode)).toBe(false);
    });
  });

  describe("erKildeSaksbehandler", () => {
    it("skal returnere true når kilde rolle er Saksbehandler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: {
          rolle: ROLLE.Saksbehandler,
          ident: "Z123456",
        },
      };

      expect(erKildeSaksbehandler(periode)).toBe(true);
    });

    it("skal returnere false når kilde rolle ikke er Saksbehandler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: {
          rolle: "Bruker",
          ident: "12345678901",
        },
      };

      expect(erKildeSaksbehandler(periode)).toBe(false);
    });

    it("skal returnere false når kilde er null", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: null,
      };

      expect(erKildeSaksbehandler(periode)).toBe(false);
    });

    it("skal returnere false når kilde er undefined", () => {
      const periode = {
        ...basePeriode,
        kilde: undefined,
      } as unknown as IRapporteringsperiode;

      expect(erKildeSaksbehandler(periode)).toBe(false);
    });
  });

  describe("pluraliserDager", () => {
    it("skal returnere 'dager' for 0", () => {
      expect(pluraliserDager(0)).toBe("dager");
    });

    it("skal returnere 'dag' for 1", () => {
      expect(pluraliserDager(1)).toBe("dag");
    });

    it("skal returnere 'dager' for 2", () => {
      expect(pluraliserDager(2)).toBe("dager");
    });

    it("skal returnere 'dager' for store tall", () => {
      expect(pluraliserDager(10)).toBe("dager");
      expect(pluraliserDager(100)).toBe("dager");
    });

    it("skal returnere 'dag' for null", () => {
      expect(pluraliserDager(null)).toBe("dag");
    });

    it("skal returnere 'dager' for negative tall", () => {
      expect(pluraliserDager(-1)).toBe("dag");
      expect(pluraliserDager(-2)).toBe("dager");
    });
  });
});
