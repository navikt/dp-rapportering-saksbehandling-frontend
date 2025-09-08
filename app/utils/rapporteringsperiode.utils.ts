import { parseISO } from "date-fns";

import type { IRapporteringsperiode } from "./types";

/**
 * Sjekker om et meldekort ble sendt inn for sent.
 * Returnerer false for ikke-innsendte meldekort, korrigeringer og saksbehandler-utfyllinger.
 *
 * @param periode Rapporteringsperioden som skal sjekkes
 * @returns true hvis meldekortet ble sendt inn etter fristen
 */
export function erMeldekortSendtForSent(periode: IRapporteringsperiode): boolean {
  const { meldedato, sisteFristForTrekk } = periode;

  // Ikke innsendte meldekort kan ikke være for sent
  if (!meldedato || !sisteFristForTrekk) {
    return false;
  }

  return parseISO(meldedato) > parseISO(sisteFristForTrekk);
}

export function sorterMeldekort(a: IRapporteringsperiode, b: IRapporteringsperiode): number {
  // Sorter først på fraOgMed (nyeste først)
  const fraOgMedA = parseISO(a.periode.fraOgMed);
  const fraOgMedB = parseISO(b.periode.fraOgMed);

  if (fraOgMedA > fraOgMedB) return -1;
  if (fraOgMedA < fraOgMedB) return 1;

  // Hvis likt, sorter på innsendtTidspunkt (nyeste først)
  const innsendtTidspunktA = a.innsendtTidspunkt ? parseISO(a.innsendtTidspunkt) : null;
  const innsendtTidspunktB = b.innsendtTidspunkt ? parseISO(b.innsendtTidspunkt) : null;

  if (innsendtTidspunktA && innsendtTidspunktB) {
    if (innsendtTidspunktA > innsendtTidspunktB) return -1;
    if (innsendtTidspunktA < innsendtTidspunktB) return 1;
  } else if (innsendtTidspunktA && !innsendtTidspunktB) {
    return -1; // A er innsendt, B er ikke
  } else if (!innsendtTidspunktA && innsendtTidspunktB) {
    return 1; // B er innsendt, A er ikke
  }

  // Hvis fortsatt likt, sorter på originalMeldekortId (eldste først)
  if (a.originalMeldekortId && !b.originalMeldekortId) return -1;
  if (!a.originalMeldekortId && b.originalMeldekortId) return 1;

  return 0; // Er helt like
}
