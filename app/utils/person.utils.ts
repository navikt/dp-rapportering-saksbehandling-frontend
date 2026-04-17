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
