import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import {
  korrigerMeldekortSchema,
  rapporteringsperiodeSchema,
  sendInnMeldekortSchema,
} from "./meldekort.schema";
import type { IKorrigerMeldekort, IRapporteringsperiode, ISendInnMeldekort } from "./types";

const periode: IRapporteringsperiode = {
  id: "periode-id",
  ident: "12345678901",
  status: "TilUtfylling",
  type: "Ordinaert",
  periode: { fraOgMed: "2025-08-18", tilOgMed: "2025-08-31" },
  dager: [
    {
      type: "Arbeidsdag",
      dagIndex: 0,
      dato: "2025-08-18",
      aktiviteter: [{ type: "Arbeid", dato: "2025-08-18", timer: "PT8H" }],
    },
  ],
  kanSendes: true,
  kanEndres: false,
  kanSendesFra: "2025-08-30T00:00:00",
  sisteFristForTrekk: null,
  opprettetAv: "Dagpenger",
  kilde: null,
  originalMeldekortId: null,
  innsendtTidspunkt: null,
  meldedato: null,
  registrertArbeidssoker: null,
};

describe("meldekortskjemaer", () => {
  it("eksporterer skjemautledede typer gjennom types-modulen", () => {
    expectTypeOf<IRapporteringsperiode>().toEqualTypeOf<
      z.infer<typeof rapporteringsperiodeSchema>
    >();
    expectTypeOf<ISendInnMeldekort>().toEqualTypeOf<z.infer<typeof sendInnMeldekortSchema>>();
    expectTypeOf<IKorrigerMeldekort>().toEqualTypeOf<z.infer<typeof korrigerMeldekortSchema>>();
  });

  it("godtar en rapporteringsperiode med nullable og valgfrie felter", () => {
    expect(rapporteringsperiodeSchema.parse(periode)).toEqual(periode);
  });

  it.each([
    { kanSendes: "true" },
    { status: "ukjent" },
    { type: "ukjent" },
    { opprettetAvNavIdent: 123 },
    { innsendtTidspunkt: "feil" },
  ])("avviser ugyldige periodefelter %j", (felter) => {
    expect(rapporteringsperiodeSchema.safeParse({ ...periode, ...felter }).success).toBe(false);
  });

  const innsending: ISendInnMeldekort = {
    ident: periode.ident,
    id: periode.id,
    periode: periode.periode,
    dager: periode.dager,
    kanSendesFra: periode.kanSendesFra,
    sisteFristForTrekk: null,
    opprettetAv: periode.opprettetAv,
    status: "Innsendt",
    kilde: { rolle: "Saksbehandler", ident: "Z123456" },
    begrunnelse: "Manuell innsending",
    registrertArbeidssoker: false,
    meldedato: null,
  };

  const korrigering: IKorrigerMeldekort = {
    ident: periode.ident,
    originalMeldekortId: periode.id,
    periode: periode.periode,
    dager: periode.dager,
    kilde: innsending.kilde,
    begrunnelse: "Korrigering",
    meldedato: "2025-09-01",
  };

  it("godtar innsending og korrigering uten ekstra responsfelter", () => {
    expect(sendInnMeldekortSchema.parse(innsending)).toEqual(innsending);
    expect(korrigerMeldekortSchema.parse(korrigering)).toEqual(korrigering);
  });

  it.each([
    { periode: { fraOgMed: "2025-08-31", tilOgMed: "2025-08-18" } },
    { dager: [{ ...periode.dager[0], dagIndex: -1 }] },
    { dager: [{ ...periode.dager[0], aktiviteter: [{ type: "ukjent", dato: "2025-08-18" }] }] },
  ])("deler validering av periode og dager mellom modellene: %j", (felter) => {
    expect(rapporteringsperiodeSchema.safeParse({ ...periode, ...felter }).success).toBe(false);
    expect(sendInnMeldekortSchema.safeParse({ ...innsending, ...felter }).success).toBe(false);
    expect(korrigerMeldekortSchema.safeParse({ ...korrigering, ...felter }).success).toBe(false);
  });
});
