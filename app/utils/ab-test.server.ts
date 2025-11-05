import type { ABTestVariant } from "./ab-test.utils";

export type { ABTestVariant, TogglePlacement } from "./ab-test.utils";
export { getTogglePlacement } from "./ab-test.utils";

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
