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
