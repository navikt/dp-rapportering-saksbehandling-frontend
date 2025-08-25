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
  const { meldedato, sisteFristForTrekk, originalMeldekortId, kilde } = periode;

  // Ikke innsendte meldekort kan ikke være for sent
  if (!meldedato) {
    return false;
  }

  // Korrigeringer og saksbehandler-utfyllinger har ikke frist
  if (originalMeldekortId || kilde?.rolle === "Saksbehandler") {
    return false;
  }

  return parseISO(meldedato) > parseISO(sisteFristForTrekk);
}
