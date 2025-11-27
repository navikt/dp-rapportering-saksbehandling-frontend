import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

// Re-eksporter fra constants fil for bakoverkompatibilitet
export { HIGHLIGHT_DURATION_MS } from "./MeldekortRad.constants";

export interface StatusConfig {
  text: string;
  variant: "success" | "info";
}

/**
 * Bestemmer statuskonfigurasjonen basert på periodens tilstand
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
 * Sjekker om perioden er i "opprettet" tilstand (opprettet, men ikke klar)
 */
export function erPeriodeOpprettet(periode: IRapporteringsperiode): boolean {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  return !erInnsendt && !periode.kanSendes;
}

/**
 * Sjekker om perioden har blitt korrigert (har en original meldekort-ID)
 */
export function erPeriodeKorrigert(periode: IRapporteringsperiode): boolean {
  return !!periode.originalMeldekortId;
}

/**
 * Sjekker om meldekortet er av typen etterregistrert
 */
export function erPeriodeEtterregistrert(periode: IRapporteringsperiode): boolean {
  return periode.type === MELDEKORT_TYPE.ETTERREGISTRERT;
}

/**
 * Sjekker om innsendingsinformasjon skal vises
 */
export function skalViseInnsendtInfo(periode: IRapporteringsperiode): boolean {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  return erInnsendt && !!periode.innsendtTidspunkt && !!periode.meldedato;
}

/**
 * Sjekker om meldekortet er opprettet av Arena
 */
export function erPeriodeOpprettetAvArena(periode: IRapporteringsperiode): boolean {
  return periode.opprettetAv === OPPRETTET_AV.Arena;
}
