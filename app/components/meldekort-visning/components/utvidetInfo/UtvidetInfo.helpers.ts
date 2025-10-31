import { ANSVARLIG_SYSTEM, ROLLE } from "~/utils/constants";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

/**
 * Sjekker om meldekortet kan endres av saksbehandler
 */
export function kanMeldekortEndres(
  periode: IRapporteringsperiode,
  ansvarligSystem: TAnsvarligSystem,
): boolean {
  return periode.kanEndres && ansvarligSystem === ANSVARLIG_SYSTEM.DP;
}

/**
 * Sjekker om meldekortet er korrigert
 */
export function erMeldekortKorrigert(periode: IRapporteringsperiode): boolean {
  return !!periode.originalMeldekortId;
}

/**
 * Sjekker om kilden er en saksbehandler
 */
export function erKildeSaksbehandler(periode: IRapporteringsperiode): boolean {
  return periode?.kilde?.rolle === ROLLE.Saksbehandler;
}

/**
 * Returnerer riktig pluralisering av "dag" basert på antall
 */
export function pluraliserDager(antall: number | null): string {
  if (antall === null) return "dag";
  const absolutt = Math.abs(antall);
  return absolutt !== 1 ? "dager" : "dag";
}
