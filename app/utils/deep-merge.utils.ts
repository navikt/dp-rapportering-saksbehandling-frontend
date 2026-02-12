/**
 * Deep partial type - gjør alle properties (også nestede) optional
 */
type DeepPartial<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

/**
 * Merger to objekter sammen, også nestede objekter.
 *
 * Typiske bruksområder:
 * - Kombinere Sanity-data med hardkodede default-verdier
 * - Overskrive kun deler av et konfigurasjonsobjekt
 *
 * Forskjell fra shallow spread:
 * - Shallow spread ({ ...a, ...b }) erstatter hele nestede objekter
 * - deepMerge bevarer egenskaper som ikke blir overskrevet
 *
 * @param target - Basis-objektet (typisk defaults)
 * @param source - Objektet som skal merges inn (kan være partiell/null/undefined)
 * @returns Et nytt objekt med deeply merged egenskaper
 *
 * @example
 * const defaults = { a: 1, b: { c: 2, d: 3 } };
 * const partial = { b: { c: 5 } };
 * deepMerge(defaults, partial);
 * // Returnerer: { a: 1, b: { c: 5, d: 3 } }
 * // vs shallow spread: { a: 1, b: { c: 5 } } <- mangler 'd'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: DeepPartial<T> | null | undefined,
): T {
  // Hvis source er null/undefined, returner en klon av target
  // Dette forhindrer at kallere utilsiktet muterer default-objektet
  if (!source) {
    return { ...target };
  }

  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      // Hvis begge verdiene er plain objects, merge dem rekursivt
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = deepMerge(targetValue, sourceValue) as any;
      } else if (sourceValue !== undefined) {
        // Ellers bruk source-verdien hvis den er definert
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

/**
 * Sjekk om en verdi er et plain object (ikke et array, null, Date, osv.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}
