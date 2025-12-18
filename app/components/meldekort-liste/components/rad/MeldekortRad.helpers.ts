import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

// Re-eksporter fra constants fil for bakoverkompatibilitet
export { HIGHLIGHT_DURATION_MS } from "./MeldekortRad.constants";

export interface StatusConfig {
  text: string;
  variant: "success" | "neutral" | "info";
}

/**
 * Bestemmer statuskonfigurasjonen basert på periodens tilstand
 */
export function getStatusConfig(
  periode: IRapporteringsperiode,
  behandlinger?: IBehandlingsresultatPeriodeMedMeta<IPengeVerdi>[],
): StatusConfig {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  const kanSendes = periode.kanSendes;

  if (behandlinger?.length) {
    return { text: "Beregning utført", variant: "success" };
  }

  if (erInnsendt) {
    return { text: "Innsendt", variant: "success" };
  }

  if (kanSendes) {
    return { text: "Klar til utfylling", variant: "info" };
  }

  return { text: "Meldekort opprettet", variant: "neutral" };
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

/**
 * Sjekker om perioden har en korrigering (et annet meldekort som korrigerer denne perioden)
 */
export function periodeHarKorrigering(
  periode: IRapporteringsperiode,
  allePerioder: IRapporteringsperiode[],
): boolean {
  return allePerioder.some((p) => p.originalMeldekortId === periode.id && p.id !== periode.id);
}

/**
 * Formaterer periode-datoer til en lesbar streng
 */
export function formaterPeriodeDatoer(
  fraOgMed: string,
  tilOgMed: string,
  formatterDato: (params: { dato: string }) => string,
): string {
  return `${formatterDato({ dato: fraOgMed })} - ${formatterDato({ dato: tilOgMed })}`;
}
