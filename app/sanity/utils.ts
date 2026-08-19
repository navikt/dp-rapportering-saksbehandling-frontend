/**
 * Sjekker om Sanity-data mangler eller er ufullstendig.
 * Returnerer true hvis objektet er null/undefined eller hvis noen required felter mangler.
 */
export function sanityDataMangler<T extends Record<string, unknown>>(
  data: T | null | undefined,
  requiredFields?: (keyof T)[],
): boolean {
  if (!data) return true;

  if (!requiredFields) return false;

  return requiredFields.some((field) => {
    const value = data[field];
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
  });
}

export function sanityTekst(
  value: string | null | undefined,
  field: string,
  isDevelopment = import.meta.env.DEV ||
    import.meta.env.MODE === "test" ||
    import.meta.env.VITEST === true ||
    (typeof process !== "undefined" && process.env.NODE_ENV !== "production"),
): string {
  if (value) return value;

  return isDevelopment ? `[Mangler Sanity: ${field}]` : "";
}
