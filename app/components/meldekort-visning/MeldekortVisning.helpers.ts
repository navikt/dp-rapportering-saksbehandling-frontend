import { ANSVARLIG_SYSTEM, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

/**
 * Sjekker om perioden er til utfylling (tomt meldekort)
 */
export function erPeriodeTilUtfylling(periode: IRapporteringsperiode): boolean {
  return periode.status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling;
}

/**
 * Sjekker om meldekortet kan sendes av bruker
 */
export function kanMeldekortSendes(
  periode: IRapporteringsperiode,
  ansvarligSystem: TAnsvarligSystem,
): boolean {
  return periode.kanSendes && ansvarligSystem === ANSVARLIG_SYSTEM.DP;
}
