import type { ABTestVariant } from "./ab-test.utils";

export type { ABTestVariant, TogglePlacement } from "./ab-test.utils";
export { getTogglePlacement } from "./ab-test.utils";

export const AB_TEST_FEATURES = {
  TOGGLE_PLACEMENT: "toggle-placement",
  KORRIGERING_LAYOUT: "korrigering-layout", // For Variant C - kun for korrigering
  // Legg til flere features her etter hvert
} as const;

export type ABTestFeature = (typeof AB_TEST_FEATURES)[keyof typeof AB_TEST_FEATURES];

/**
 * Konfigurasjon for hva Variant C gjør for hver feature
 */
export const VARIANT_C_CONFIG: Record<ABTestFeature, string> = {
  [AB_TEST_FEATURES.TOGGLE_PLACEMENT]: "left", // Variant C: toggle left (samme som A)
  [AB_TEST_FEATURES.KORRIGERING_LAYOUT]: "special", // Variant C: spesiell layout for korrigering
};

/**
 * Henter AB-test variant fra URL query params.
 * Kun aktivt i demo-miljø.
 *
 * @param request - Request objektet fra loader
 * @returns Variant A, B, C eller null hvis ingen variant spesifisert
 */
export function getABTestVariant(request: Request): ABTestVariant {
  // Kun aktiv i demo-miljø
  if (process.env.RUNTIME_ENVIRONMENT !== "demo") {
    return null;
  }

  const url = new URL(request.url);
  const variant = url.searchParams.get("variant");

  // Valider at det er en gyldig variant
  if (variant === "A" || variant === "B" || variant === "C") {
    return variant;
  }

  return null; // Returner null hvis ingen variant spesifisert (ikke default til A)
}

/**
 * Sjekker om AB-testing er aktivert (dvs. om vi er i demo-miljø)
 */
export function isABTestingEnabled(): boolean {
  return process.env.RUNTIME_ENVIRONMENT === "demo";
}

/**
 * Bygger URL med variant query parameter
 */
export function buildVariantURL(baseURL: string, variant: ABTestVariant): string {
  const url = new URL(baseURL, "http://dummy.com"); // Dummy base for relative URLs

  if (variant) {
    url.searchParams.set("variant", variant);
  } else {
    url.searchParams.delete("variant");
  }

  return url.pathname + url.search;
}

/**
 * Sjekker om en spesiell feature skal være aktiv for gitt variant
 * Brukes f.eks. for å sjekke om Variant C skal vise korrigering-layout
 */
export function shouldShowFeature(
  variant: ABTestVariant | null,
  feature: ABTestFeature,
  context?: Record<string, unknown>,
): boolean {
  if (!variant) return false;

  // Variant C + KORRIGERING_LAYOUT: kun vis hvis det faktisk er en korrigering
  if (variant === "C" && feature === AB_TEST_FEATURES.KORRIGERING_LAYOUT) {
    return context?.isKorrigering === true;
  }

  return false;
}
