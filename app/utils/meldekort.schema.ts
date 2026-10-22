import { z } from "zod";

import {
  AKTIVITET_TYPE,
  MELDEKORT_TYPE,
  OPPRETTET_AV,
  RAPPORTERINGSPERIODE_STATUS,
  ROLLE,
} from "./constants";

const nonEmptyString = z.string().trim().min(1);
const dateOrDateTime = z.union([z.iso.date(), z.iso.datetime({ offset: true, local: true })]);

export const periodeSchema = z
  .object({ fraOgMed: z.iso.date(), tilOgMed: z.iso.date() })
  .refine((periode) => periode.fraOgMed <= periode.tilOgMed, {
    message: "Fra-dato må være før eller lik til-dato.",
    path: ["tilOgMed"],
  });

export const aktivitetSchema = z.object({
  id: nonEmptyString.optional(),
  type: z.enum(AKTIVITET_TYPE),
  dato: z.iso.date(),
  timer: z.iso.duration().nullish(),
});

export const rapporteringsperiodeDagSchema = z.object({
  type: nonEmptyString,
  dagIndex: z.number().int().nonnegative(),
  dato: z.iso.date(),
  aktiviteter: z.array(aktivitetSchema),
});

export const kildeSchema = z.object({
  rolle: z.enum(ROLLE),
  ident: nonEmptyString,
});

export const rapporteringsperiodeSchema = z.object({
  id: nonEmptyString,
  ident: nonEmptyString,
  status: z.enum(RAPPORTERINGSPERIODE_STATUS),
  type: z.enum(MELDEKORT_TYPE),
  periode: periodeSchema,
  dager: z.array(rapporteringsperiodeDagSchema),
  kanSendes: z.boolean(),
  kanEndres: z.boolean(),
  kanSendesFra: dateOrDateTime,
  sisteFristForTrekk: dateOrDateTime.nullable(),
  opprettetAv: z.enum(OPPRETTET_AV),
  opprettetAvNavIdent: nonEmptyString.nullish(),
  begrunnelse: z.string().optional(),
  kilde: kildeSchema.nullable(),
  originalMeldekortId: nonEmptyString.nullable(),
  innsendtTidspunkt: dateOrDateTime.nullable(),
  meldedato: z.iso.date().nullable(),
  registrertArbeidssoker: z.boolean().nullable(),
});

export const sendInnMeldekortSchema = rapporteringsperiodeSchema
  .pick({
    ident: true,
    id: true,
    periode: true,
    dager: true,
    kanSendesFra: true,
    sisteFristForTrekk: true,
    opprettetAv: true,
    meldedato: true,
  })
  .extend({
    status: z.literal(RAPPORTERINGSPERIODE_STATUS.Innsendt),
    kilde: kildeSchema,
    begrunnelse: z.string(),
    innsendtTidspunkt: rapporteringsperiodeSchema.shape.innsendtTidspunkt.optional(),
    registrertArbeidssoker: z.boolean(),
  });

export const korrigerMeldekortSchema = rapporteringsperiodeSchema
  .pick({
    ident: true,
    periode: true,
    dager: true,
  })
  .extend({
    originalMeldekortId: nonEmptyString,
    kilde: kildeSchema,
    begrunnelse: z.string(),
    meldedato: z.iso.date(),
  });

export type IPeriode = z.infer<typeof periodeSchema>;
export type IAktivitet = z.infer<typeof aktivitetSchema>;
export type IRapporteringsperiodeDag = z.infer<typeof rapporteringsperiodeDagSchema>;
export type IKilde = z.infer<typeof kildeSchema>;
export type IRapporteringsperiode = z.infer<typeof rapporteringsperiodeSchema>;
export type ISendInnMeldekort = z.infer<typeof sendInnMeldekortSchema>;
export type IKorrigerMeldekort = z.infer<typeof korrigerMeldekortSchema>;
