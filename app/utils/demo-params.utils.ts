/**
 * Utilities for håndtering av demo/dev query parameters
 * Brukes for å propagere params som variant osv
 */

import type { ABTestVariant } from "./ab-test.utils";

/**
 * Query parameters som skal propageres automatisk i demo/dev miljø
 */
export const DEMO_PARAMS = {
  VARIANT: "variant",
  STATUS: "status",
  ACTION: "action",
} as const;

/**
 * Status-verdier for demo-miljø
 * - "404-person": Person ikke funnet
 * - "404-perioder": Meldekort for person ikke funnet
 * - "404-periode": Spesifikt meldekort ikke funnet
 * - "404-page": Side ikke funnet (404 page)
 * - "500-person": Serverfeil ved henting av person
 * - "500-perioder": Serverfeil ved henting av meldekort
 * - "500-periode": Serverfeil ved henting av spesifikt meldekort
 * - "401-token": Simulerer manglende/ugyldig token
 */
export type DemoStatus =
  | "404-person"
  | "404-perioder"
  | "404-periode"
  | "404-page"
  | "500-person"
  | "500-perioder"
  | "500-periode"
  | "401-token"
  | null;

/**
 * Action-verdier for demo-miljø
 */
export type DemoAction = "ok" | "fail" | null;

/**
 * Henter alle demo-relevante query params fra en URL
 */
export function getDemoParams(url: string | URL | Request): Record<string, string> {
  const urlObj =
    typeof url === "string"
      ? new URL(url, "http://dummy")
      : url instanceof Request
        ? new URL(url.url)
        : url;
  const params: Record<string, string> = {};

  // Sjekk alle demo params
  Object.values(DEMO_PARAMS).forEach((paramName) => {
    const value = urlObj.searchParams.get(paramName);
    if (value) {
      params[paramName] = value;
    }
  });

  return params;
}

/**
 * Legger til alle demo params fra current URL til en target URL
 * Brukes for å bevare demo params ved navigering
 */
export function addDemoParamsToURL(targetUrl: URL, sourceUrl?: string | URL | Request): void {
  if (!sourceUrl) {
    // Bruk window.location hvis vi er i browser og ingen source er gitt
    if (typeof window !== "undefined") {
      sourceUrl = window.location.href;
    } else {
      return;
    }
  }

  const demoParams = getDemoParams(sourceUrl);

  Object.entries(demoParams).forEach(([key, value]) => {
    targetUrl.searchParams.set(key, value);
  });
}

/**
 * Lager en URL med demo params fra current context
 * Convenience funksjon for å lage URLs med alle demo params
 */
export function buildURLWithDemoParams(
  path: string,
  additionalParams?: Record<string, string>,
): string {
  const url = new URL(
    path,
    typeof window !== "undefined" ? window.location.origin : "http://dummy",
  );

  // Legg til demo params fra current URL
  addDemoParamsToURL(url);

  // Legg til eventuelle additional params
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.pathname + url.search;
}

/**
 * Type-safe getter for variant
 */
export function getVariant(url: string | URL | Request): ABTestVariant {
  const urlObj =
    typeof url === "string"
      ? new URL(url, "http://dummy")
      : url instanceof Request
        ? new URL(url.url)
        : url;
  const variant = urlObj.searchParams.get(DEMO_PARAMS.VARIANT);

  if (variant === "A" || variant === "B") {
    return variant;
  }

  return null;
}

/**
 * Type-safe getter for status
 */
export function getDemoStatus(url: string | URL | Request): DemoStatus {
  const urlObj =
    typeof url === "string"
      ? new URL(url, "http://dummy")
      : url instanceof Request
        ? new URL(url.url)
        : url;
  const status = urlObj.searchParams.get(DEMO_PARAMS.STATUS);

  if (
    status === "404-person" ||
    status === "404-perioder" ||
    status === "404-periode" ||
    status === "404-page" ||
    status === "500-person" ||
    status === "500-perioder" ||
    status === "500-periode" ||
    status === "401-token"
  ) {
    return status;
  }

  return null;
}

/**
 * Type-safe getter for action
 */
export function getDemoAction(url: string | URL | Request): DemoAction {
  const urlObj =
    typeof url === "string"
      ? new URL(url, "http://dummy")
      : url instanceof Request
        ? new URL(url.url)
        : url;
  const action = urlObj.searchParams.get(DEMO_PARAMS.ACTION);

  if (action === "ok" || action === "fail") {
    return action;
  }

  return null;
}
