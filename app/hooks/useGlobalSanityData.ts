import { useRouteLoaderData } from "react-router";

import type { GlobalSanityData } from "~/sanity/fetchGlobalData";

/**
 * Hook for å hente Sanity CMS data fra root loader.
 * Returnerer null hvis data ikke er tilgjengelig (f.eks. i test-miljø).
 *
 * @example
 * const sanityData = useGlobalSanityData();
 * const aktivitetLabels = sanityData?.aktiviteter?.jobb.kort ?? "Jobb";
 */
export function useGlobalSanityData(): GlobalSanityData | null {
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    // Håndter test-miljø eller andre tilfeller hvor router ikke er tilgjengelig
    return null;
  }

  return rootData?.sanityData ?? null;
}
