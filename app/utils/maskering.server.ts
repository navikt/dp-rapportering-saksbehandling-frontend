import { maskerVerdi } from "./masker-verdi";
import type { IPerson } from "./types";

/**
 * Leser skjulSensitiveOpplysninger-innstillingen fra cookie.
 * Default er true (skjul) av sikkerhetshensyn.
 */
export function skalSkjuleSensitiveOpplysninger(request: Request): boolean {
  const cookieHeader = request.headers.get("Cookie");
  const skjulValue = cookieHeader?.match(/skjul-sensitive-opplysninger=([^;]+)/)?.[1];

  // Parse fra localStorage format (JSON boolean)
  if (skjulValue !== undefined) {
    try {
      return JSON.parse(skjulValue);
    } catch {
      // Ved parse-feil, default til true (sikker side)
      return true;
    }
  }

  // Default til true (skjul sensitive data) hvis cookie ikke er satt
  return true;
}

/**
 * Maskerer sensitive felt i person-objektet.
 * Brukes server-side for å unngå at sensitive data sendes til klienten.
 */
export function maskerPerson(person: IPerson): IPerson {
  return {
    ...person,
    fornavn: maskerVerdi(person.fornavn),
    mellomnavn: person.mellomnavn ? maskerVerdi(person.mellomnavn) : person.mellomnavn,
    etternavn: maskerVerdi(person.etternavn),
    ident: maskerVerdi(person.ident),
  };
}
