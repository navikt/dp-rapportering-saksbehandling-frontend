import type { RefObject } from "react";

import { MELDEKORT_TYPE, OPPRETTET_AV } from "./constants";
import { erAlleArbeidsaktiviteterGyldige, type IKorrigertDag } from "./korrigering.utils";
import type { IAktivitet, IRapporteringsperiodeDag, TOpprettetAv } from "./types";

/**
 * Resultat fra validering av meldekortskjema
 */
export interface IValideringsFeil {
  meldedato: boolean;
  arbeidssoker: boolean;
  begrunnelse: boolean;
  aktiviteter: boolean;
  aktiviteterType?: "ingen-endringer" | "ugyldige-verdier";
}

/**
 * Kontekst for validering - definerer hvilke valideringsregler som gjelder
 */
export interface IValideringsKontekst {
  /** Om dette er en korrigering av eksisterende meldekort */
  isKorrigering: boolean;
  /** Om arbeidssøker-spørsmålet skal vises og valideres */
  showArbeidssokerField: boolean;
  /** Originale data for sammenligning ved korrigering */
  originalData?: {
    meldedato: string | null;
    dager: IRapporteringsperiodeDag[];
  };
}

/**
 * Data som skal valideres
 */
export interface ISkjemaData {
  meldedato: Date | null;
  registrertArbeidssoker: boolean | null;
  begrunnelse: string;
  dager: IKorrigertDag[];
}

/**
 * Sjekker om arbeidssøker-spørsmålet skal vises basert på meldekorttype.
 *
 * @param meldekortType - Type meldekort fra IRapporteringsperiode.type
 * @param erSaksbehandlerFlate - Om dette er saksbehandlerflaten
 * @param opprettetAv - Hvem som opprettet meldekortet (Arena eller Dagpenger)
 * @returns true hvis spørsmålet skal vises
 */
export function skalViseArbeidssokerSporsmal(
  meldekortType: string | undefined,
  erSaksbehandlerFlate: boolean,
  opprettetAv?: TOpprettetAv,
): boolean {
  if (!erSaksbehandlerFlate) {
    return true;
  }

  // Skjul spørsmålet for etterregistrerte meldekort og Arena-meldekort i saksbehandlerflaten
  if (meldekortType === MELDEKORT_TYPE.ETTERREGISTRERT) {
    return false;
  }

  if (opprettetAv === OPPRETTET_AV.Arena) {
    return false;
  }

  return true;
}

/**
 * Sammenligner to dagsarrays for å se om aktiviteter har endret seg.
 * Bruker strukturert sammenligning i stedet for JSON.stringify.
 *
 * @param opprinneligeDager - Originale dager fra backend
 * @param redigerteDager - Redigerte dager fra skjema
 * @returns true hvis aktivitetene har endret seg
 */
export function harAktivitetEndringer(
  opprinneligeDager: IRapporteringsperiodeDag[],
  redigerteDager: IRapporteringsperiodeDag[],
): boolean {
  if (opprinneligeDager.length !== redigerteDager.length) {
    return true;
  }

  return opprinneligeDager.some((opprinneligDag, index) => {
    const redigertDag = redigerteDager[index];

    if (!redigertDag || opprinneligDag.dato !== redigertDag.dato) {
      return true;
    }

    return harAktivitetEndringerForDag(opprinneligDag.aktiviteter, redigertDag.aktiviteter);
  });
}

/**
 * Sammenligner aktiviteter for en enkelt dag
 */
function harAktivitetEndringerForDag(opprinnelige: IAktivitet[], redigerte: IAktivitet[]): boolean {
  if (opprinnelige.length !== redigerte.length) {
    return true;
  }

  // Sorter begge arrays etter type og dato for konsistent sammenligning
  const sorterteOpprinnelige = [...opprinnelige].sort((a, b) =>
    a.type.localeCompare(b.type) !== 0
      ? a.type.localeCompare(b.type)
      : a.dato.localeCompare(b.dato),
  );
  const sorterteRedigerte = [...redigerte].sort((a, b) =>
    a.type.localeCompare(b.type) !== 0
      ? a.type.localeCompare(b.type)
      : a.dato.localeCompare(b.dato),
  );

  return sorterteOpprinnelige.some((opprinnelig, index) => {
    const redigert = sorterteRedigerte[index];

    if (!redigert) {
      return true;
    }

    return (
      opprinnelig.type !== redigert.type ||
      opprinnelig.dato !== redigert.dato ||
      opprinnelig.timer !== redigert.timer
    );
  });
}

/**
 * Sjekker om meldedato har endret seg
 *
 * @param opprinneligMeldedato - Original meldedato (yyyy-mm-dd eller null)
 * @param nyMeldedato - Ny meldedato som Date eller null
 * @returns true hvis meldedato har endret seg
 */
export function harMeldedatoEndring(
  opprinneligMeldedato: string | null,
  nyMeldedato: Date | null,
): boolean {
  if (!nyMeldedato) {
    return false;
  }

  const nyDatoString = formaterDatoTilYYYYMMDD(nyMeldedato);
  return nyDatoString !== opprinneligMeldedato;
}

/**
 * Formaterer Date til yyyy-mm-dd format
 */
function formaterDatoTilYYYYMMDD(dato: Date): string {
  const year = dato.getFullYear();
  const month = String(dato.getMonth() + 1).padStart(2, "0");
  const day = String(dato.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Sjekker om skjemaet har endringer ved korrigering
 */
export function harSkjemaEndringer(
  skjemaData: ISkjemaData,
  kontekst: IValideringsKontekst,
): boolean {
  if (!kontekst.isKorrigering || !kontekst.originalData) {
    return true; // Ikke korrigering, så vi bryr oss ikke om endringer
  }

  const harMeldedato = harMeldedatoEndring(kontekst.originalData.meldedato, skjemaData.meldedato);
  const harAktivitet = harAktivitetEndringer(kontekst.originalData.dager, skjemaData.dager);

  return harMeldedato || harAktivitet;
}

/**
 * Sjekker om skjemaet har minst én gyldig aktivitet
 */
export function harGyldigeAktiviteter(dager: IRapporteringsperiodeDag[]): boolean {
  return dager.some((dag) => dag.aktiviteter.length > 0);
}

/**
 * Validerer meldekortskjema basert på kontekst (korrigering vs fyll ut)
 *
 * Valideringsregler:
 * - Korrigering: Må ha (meldedato ELLER aktivitet endret) OG begrunnelse
 * - Fyll ut: Må ha meldedato OG besvart arbeidssøker-spørsmål (hvis vist) OG begrunnelse
 *   (aktivitet er IKKE påkrevd ved fyll ut)
 *
 * @param skjemaData - Data fra skjemaet som skal valideres
 * @param kontekst - Kontekst som definerer valideringsregler
 * @returns Objekt med feil per felt (true = har feil)
 */
export function validerMeldekortSkjema(
  skjemaData: ISkjemaData,
  kontekst: IValideringsKontekst,
): IValideringsFeil {
  const { meldedato, registrertArbeidssoker, begrunnelse, dager } = skjemaData;
  const { isKorrigering, showArbeidssokerField } = kontekst;

  // Sjekk om alle arbeidsaktiviteter har gyldige timer-verdier
  const harUgyldigeAktiviteter = dager ? !erAlleArbeidsaktiviteterGyldige(dager) : false;

  if (isKorrigering) {
    // Korrigering: Må ha endringer (meldedato ELLER aktivitet) + begrunnelse
    const harEndringer = harSkjemaEndringer(skjemaData, kontekst);
    const harAktivitetFeil = !harEndringer || harUgyldigeAktiviteter;

    return {
      meldedato: false, // Meldedato er ikke påkrevd ved korrigering (kan være uendret)
      arbeidssoker: false, // Arbeidssøker-spørsmålet vises ikke ved korrigering
      begrunnelse: begrunnelse.trim() === "",
      aktiviteter: harAktivitetFeil,
      aktiviteterType: harAktivitetFeil
        ? harUgyldigeAktiviteter
          ? "ugyldige-verdier"
          : "ingen-endringer"
        : undefined,
    };
  } else {
    // Fyll ut: Må ha meldedato + besvart arbeidssøker + begrunnelse (aktivitet IKKE påkrevd)
    return {
      meldedato: !meldedato,
      arbeidssoker: showArbeidssokerField && registrertArbeidssoker === null,
      begrunnelse: begrunnelse.trim() === "",
      aktiviteter: harUgyldigeAktiviteter,
      aktiviteterType: harUgyldigeAktiviteter ? "ugyldige-verdier" : undefined,
    };
  }
}

/**
 * Fokuserer på første felt med feil
 *
 * @param feil - Valideringsfeil fra validerMeldekortSkjema
 * @param refs - Refs til skjemafelt
 */
export interface ISkjemaRefs {
  meldedatoRef: RefObject<HTMLElement | null>;
  arbeidssokerRef: RefObject<HTMLElement | null>;
  begrunnelseRef: RefObject<HTMLElement | null>;
  aktiviteterRef: RefObject<HTMLElement | null>;
}

export function fokuserPaForsteFeil(feil: IValideringsFeil, refs: ISkjemaRefs): void {
  const { meldedato, arbeidssoker, begrunnelse, aktiviteter } = feil;
  const { meldedatoRef, arbeidssokerRef, begrunnelseRef, aktiviteterRef } = refs;

  if (meldedato) {
    meldedatoRef.current?.focus();
    return;
  }

  if (arbeidssoker) {
    arbeidssokerRef.current?.focus();
    return;
  }

  if (begrunnelse) {
    begrunnelseRef.current?.focus();
    return;
  }

  if (aktiviteter) {
    aktiviteterRef.current?.focus();
    return;
  }
}

/**
 * Genererer feilmeldinger basert på kontekst
 *
 * @param kontekst - Valideringskontekst
 * @returns Objekt med feilmeldinger per felt
 */
export interface IFeilmeldinger {
  meldedato: string;
  arbeidssoker: string;
  begrunnelse: string;
  aktiviteter: string;
}

export function lagValideringsFeilmeldinger(kontekst: IValideringsKontekst): IFeilmeldinger {
  if (kontekst.isKorrigering) {
    return {
      meldedato: "Du må velge en meldedato",
      arbeidssoker: "", // Vises ikke ved korrigering
      begrunnelse: "Du må oppgi en begrunnelse for korrigeringen",
      aktiviteter: "Du må endre enten meldedato eller aktivitet for å kunne sende inn korrigering",
    };
  } else {
    return {
      meldedato: "Du må velge en meldedato",
      arbeidssoker: "Du må svare på om brukeren skal være registrert som arbeidssøker",
      begrunnelse: "Du må oppgi en begrunnelse",
      aktiviteter: "", // Ikke påkrevd ved fyll ut
    };
  }
}
