import { describe, expect, it } from "vitest";

import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import {
  byggOppdateringsmelding,
  finnOppdaterteAar,
  finnOppdatertePerioder,
  hentOppdaterteNokler,
} from "./personPerioder.helpers";

const periode = {
  id: "periode-1",
  ident: "12345678901",
  status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
  type: MELDEKORT_TYPE.ORDINAERT,
  periode: { fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" },
  dager: [],
  kanSendes: false,
  kanEndres: true,
  kanSendesFra: "2025-01-19T00:00:00",
  sisteFristForTrekk: null,
  opprettetAv: OPPRETTET_AV.Dagpenger,
  kilde: null,
  originalMeldekortId: null,
  innsendtTidspunkt: null,
  meldedato: null,
  registrertArbeidssoker: null,
} satisfies IRapporteringsperiode;

const perioder: IRapporteringsperiode[] = [
  periode,
  {
    ...periode,
    id: "periode-2",
    periode: { fraOgMed: "2026-01-05", tilOgMed: "2026-01-18" },
  },
];

describe("personPerioder.helpers", () => {
  it("henter oppdaterte nøkler fra URL-parametere", () => {
    expect(hentOppdaterteNokler(new URLSearchParams("oppdatert=periode-1,periode-2"))).toEqual([
      "periode-1",
      "periode-2",
    ]);
  });

  it("finner perioder og år som er oppdatert", () => {
    const oppdaterteNokler = ["periode-1", "2026-01-05_2026-01-18"];

    expect(finnOppdatertePerioder(perioder, oppdaterteNokler)).toEqual(perioder);
    expect(finnOppdaterteAar(perioder, oppdaterteNokler)).toEqual([2025, 2026]);
  });

  it("bygger melding for opprettede meldekort", () => {
    expect(byggOppdateringsmelding(perioder, true)).toBe("2 nye meldekort ble opprettet");
  });

  it("bygger melding for innsendt meldekort", () => {
    expect(byggOppdateringsmelding([perioder[0]], false)).toBe(
      "Meldekort for uke 2 - 3 ble sendt inn",
    );
  });

  it("bygger melding for korrigert meldekort", () => {
    expect(
      byggOppdateringsmelding([{ ...perioder[0], originalMeldekortId: "original-1" }], false),
    ).toBe("Meldekort for uke 2 - 3 ble korrigert og oppdatert");
  });
});
