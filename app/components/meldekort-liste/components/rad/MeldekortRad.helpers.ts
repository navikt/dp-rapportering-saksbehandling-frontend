import type { IMeldekortStatuser } from "~/sanity/fellesKomponenter/statuser/types";
import { sanityTekst } from "~/sanity/utils";
import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

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
  statuser?: IMeldekortStatuser | null,
): StatusConfig {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  const kanSendes = periode.kanSendes;

  if (behandlinger?.length) {
    return { text: "Beregnet", variant: "success" };
  }

  if (erInnsendt) {
    return { text: sanityTekst(statuser?.innsendt, "statuser.innsendt"), variant: "info" };
  }

  if (kanSendes) {
    return { text: sanityTekst(statuser?.tilUtfylling, "statuser.tilUtfylling"), variant: "info" };
  }

  if (periode.opprettetAvNavIdent) {
    return {
      text: sanityTekst(
        statuser?.meldekortOpprettetManuelt ?? "Meldekort manuelt opprettet",
        "statuser.meldekortOpprettetManuelt",
      ),
      variant: "neutral",
    };
  }

  return {
    text: sanityTekst(statuser?.meldekortOpprettet, "statuser.meldekortOpprettet"),
    variant: "neutral",
  };
}

/**
 * Sjekker om perioden er i "opprettet" tilstand (opprettet, men ikke klar)
 */
export function erPeriodeOpprettet(periode: IRapporteringsperiode): boolean {
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  return !erInnsendt && !periode.kanSendes;
}

/**
 * Sjekker om perioden har blitt korrigert (har en original meldekort-ID eller er av type Korrigert)
 */
export function erPeriodeKorrigert(periode: IRapporteringsperiode): boolean {
  return !!periode.originalMeldekortId || periode.type === MELDEKORT_TYPE.KORRIGERT;
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
 * Sjekker om perioden har en korrigering (et annet meldekort av type Korrigert som korrigerer denne perioden)
 */
export function periodeHarKorrigering(
  periode: IRapporteringsperiode,
  allePerioder: IRapporteringsperiode[],
): boolean {
  return allePerioder.some(
    (p) =>
      p.type === MELDEKORT_TYPE.KORRIGERT &&
      p.originalMeldekortId === periode.id &&
      p.id !== periode.id,
  );
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
