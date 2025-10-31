import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

export const HIGHLIGHT_DURATION_MS = 3600;

export interface StatusConfig {
  text: string;
  variant: "success" | "info";
}

/**
 * Determines the status configuration based on the period state
 */
export function getStatusConfig(periode: IRapporteringsperiode): StatusConfig {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  const kanSendes = periode.kanSendes;

  if (erInnsendt) {
    return { text: "Innsendt", variant: "success" };
  }

  if (kanSendes) {
    return { text: "Klar til utfylling", variant: "info" };
  }

  return { text: "Meldekort opprettet", variant: "info" };
}

/**
 * Checks if the period is in "opprettet" state (created but not ready)
 */
export function erPeriodeOpprettet(periode: IRapporteringsperiode): boolean {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  return !erInnsendt && !periode.kanSendes;
}

/**
 * Checks if the period has been corrected (has an original meldekort ID)
 */
export function erPeriodeKorrigert(periode: IRapporteringsperiode): boolean {
  return !!periode.originalMeldekortId;
}

/**
 * Checks if innsending information should be displayed
 */
export function skalViseInnsendtInfo(periode: IRapporteringsperiode): boolean {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  return erInnsendt && !!periode.innsendtTidspunkt && !!periode.meldedato;
}
