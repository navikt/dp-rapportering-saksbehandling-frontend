import { logger } from "~/models/logger.server";

import { sanityClient } from "./client";
import { aktiviteterQuery } from "./fellesKomponenter/aktiviteter/queries";
import type { IMeldekortAktiviteter } from "./fellesKomponenter/aktiviteter/types";
import { bekreftModalQuery } from "./fellesKomponenter/bekreft-modal/queries";
import type { IMeldekortBekreftModal } from "./fellesKomponenter/bekreft-modal/types";
import { headerQuery } from "./fellesKomponenter/header/queries";
import type { IMeldekortHeader } from "./fellesKomponenter/header/types";
import { historikkModalQuery } from "./fellesKomponenter/historikk-modal/queries";
import type { IMeldekortHistorikkModal } from "./fellesKomponenter/historikk-modal/types";
import { personlinjeQuery } from "./fellesKomponenter/personlinje/queries";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";

export interface GlobalSanityData {
  header: IMeldekortHeader | null;
  personlinje: IMeldekortPersonlinje | null;
  bekreftModal: IMeldekortBekreftModal | null;
  historikkModal: IMeldekortHistorikkModal | null;
  aktiviteter: IMeldekortAktiviteter | null;
}

/**
 * Henter alle globale Sanity-data som trengs på tvers av siden.
 * Returnerer alltid et objekt, også ved feil (med null-verdier).
 */
export async function fetchGlobalSanityData(): Promise<GlobalSanityData> {
  try {
    const [header, personlinje, bekreftModal, historikkModal, aktiviteter] = await Promise.all([
      sanityClient.fetch<IMeldekortHeader>(headerQuery),
      sanityClient.fetch<IMeldekortPersonlinje>(personlinjeQuery),
      sanityClient.fetch<IMeldekortBekreftModal>(bekreftModalQuery),
      sanityClient.fetch<IMeldekortHistorikkModal>(historikkModalQuery),
      sanityClient.fetch<IMeldekortAktiviteter>(aktiviteterQuery),
    ]);

    return { header, personlinje, bekreftModal, historikkModal, aktiviteter };
  } catch (error) {
    logger.error("Kunne ikke hente globale data fra Sanity:", { error });
    return {
      header: null,
      personlinje: null,
      bekreftModal: null,
      historikkModal: null,
      aktiviteter: null,
    };
  }
}
