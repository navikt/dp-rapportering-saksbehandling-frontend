import { logger } from "~/models/logger.server";

import { sanityClient } from "./client";
import { headerQuery } from "./fellesKomponenter/header/queries";
import type { IMeldekortHeader } from "./fellesKomponenter/header/types";
import { personlineQuery } from "./fellesKomponenter/personlinje/queries";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";

export interface GlobalSanityData {
  header: IMeldekortHeader | null;
  personlinje: IMeldekortPersonlinje | null;
}

/**
 * Henter alle globale Sanity-data som trengs på tvers av siden.
 * Returnerer alltid et objekt, også ved feil (med null-verdier).
 */
export async function fetchGlobalSanityData(): Promise<GlobalSanityData> {
  try {
    const [header, personlinje] = await Promise.all([
      sanityClient.fetch<IMeldekortHeader>(headerQuery),
      sanityClient.fetch<IMeldekortPersonlinje>(personlineQuery),
    ]);

    return { header, personlinje };
  } catch (error) {
    logger.error("Kunne ikke hente globale data fra Sanity:", { error });
    return { header: null, personlinje: null };
  }
}
