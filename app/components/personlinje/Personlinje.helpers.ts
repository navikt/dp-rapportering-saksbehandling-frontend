import { differenceInYears } from "date-fns";

/**
 * Bygger fullt navn fra fornavn, mellomnavn og etternavn
 * Håndterer tilfeller hvor mellomnavn kan være null/undefined
 */
export function byggFulltNavn(
  fornavn: string,
  mellomnavn: string | null | undefined,
  etternavn: string,
): string {
  const navneDeler = [fornavn, mellomnavn, etternavn].filter(Boolean);
  return navneDeler.join(" ");
}

/**
 * Beregner alder basert på fødselsdato
 * Returnerer antall hele år mellom fødselsdato og i dag
 */
export function beregnAlder(fodselsdato: Date | string): number {
  const dato = typeof fodselsdato === "string" ? new Date(fodselsdato) : fodselsdato;
  return differenceInYears(new Date(), dato);
}

/**
 * Returnerer CSS-klassenavn for kjønn
 */
export function getKjonnKlasse(kjonn: string | null | undefined): string {
  if (kjonn === "MANN") {
    return "iconContainerMann";
  }
  if (kjonn === "KVINNE") {
    return "iconContainerKvinne";
  }
  return "";
}

/**
 * Sjekker om kjønn er mann
 */
export function erMann(kjonn: string | null | undefined): boolean {
  return kjonn === "MANN";
}

/**
 * Sjekker om kjønn er kvinne
 */
export function erKvinne(kjonn: string | null | undefined): boolean {
  return kjonn === "KVINNE";
}

/**
 * Formaterer tekst med sensitiv styling hvis skjult
 */
export function formaterSensitivTekst(
  tekst: string,
  erSkjult: boolean,
  maskeringsFunksjon: (tekst: string) => string,
): { tekst: string; erSensitiv: boolean } {
  if (erSkjult) {
    return {
      tekst: maskeringsFunksjon(tekst),
      erSensitiv: true,
    };
  }
  return {
    tekst,
    erSensitiv: false,
  };
}
