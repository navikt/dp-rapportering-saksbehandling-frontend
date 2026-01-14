import type { ABTestVariant } from "./ab-test.utils";

export type { ABTestVariant, TogglePlacement } from "./ab-test.utils";
export { buildVariantURL, getTogglePlacement } from "./ab-test.utils";

/**
 * Henter AB-test variant fra URL query params.
 * Kun aktivt i demo-miljø.
 *
 * @param request - Request objektet fra loader
 * @returns Variant A, B eller null hvis ingen variant spesifisert
 */
export function getABTestVariant(request: Request): ABTestVariant {
  // Kun aktiv i demo-miljø
  if (process.env.RUNTIME_ENVIRONMENT !== "demo") {
    return null;
  }

  const url = new URL(request.url);
  const variant = url.searchParams.get("variant");

  // Valider at det er en gyldig variant
  if (variant === "A" || variant === "B") {
    return variant;
  }

  // Returner null hvis ingen variant spesifisert
  // NB: Variant A kan være både "A" eller null
  return null;
}

/**
 * Sjekker om AB-testing er aktivert (dvs. om vi er i demo-miljø)
 * @deprecated Bruk isDemoToolsEnabled() for bredere kontekst
 */
export function isABTestingEnabled(): boolean {
  return process.env.RUNTIME_ENVIRONMENT === "demo";
}

/**
 * Sjekker om demo-verktøy er aktivert (AB-testing, feilsimulering, etc.)
 * Dette er alias for isABTestingEnabled() men med mer beskrivende navn
 */
export function isDemoToolsEnabled(): boolean {
  return process.env.RUNTIME_ENVIRONMENT === "demo";
}
