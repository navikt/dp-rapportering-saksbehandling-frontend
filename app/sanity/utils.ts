import { getEnv } from "~/utils/env.utils";

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

function isDemoRuntime(): boolean {
  return getEnv("RUNTIME_ENVIRONMENT") === "demo";
}

function skalViseManglerSanityTekst(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env.MODE === "test" ||
    import.meta.env.VITEST === true ||
    (typeof process !== "undefined" && process.env.NODE_ENV !== "production") ||
    isDemoRuntime()
  );
}

export function sanityTekst(
  value: string | null | undefined,
  field: string,
  showMissingSanityText = skalViseManglerSanityTekst(),
): string {
  if (value) return value;

  return showMissingSanityText ? `[Mangler Sanity: ${field}]` : "";
}
