/**
 * Klient-side utilities for AB testing
 * Disse funksjonene kan brukes både på server og klient
 */

export type ABTestVariant = "A" | "B" | "C" | null;
export type TogglePlacement = "left" | "right";

/**
 * Bestemmer toggle placement basert på variant
 * Kan brukes både på server og klient
 */
export function getTogglePlacement(variant: ABTestVariant): TogglePlacement {
  // Kun Variant B har toggle på høyre side
  return variant === "B" ? "right" : "left";
}

/**
 * Legger til variant query parameter til en URL hvis variant finnes
 * Kan brukes både på server og klient
 */
export function addVariantToURL(url: URL, variant: ABTestVariant): void {
  if (variant) {
    url.searchParams.set("variant", variant);
  }
}

/**
 * Bygger URL med variant query parameter
 * Kan brukes både på server og klient
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
