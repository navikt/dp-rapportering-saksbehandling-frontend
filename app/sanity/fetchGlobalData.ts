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
import { kalenderQuery } from "./fellesKomponenter/kalender/queries";
import type { IMeldekortKalender } from "./fellesKomponenter/kalender/types";
import { personlinjeQuery } from "./fellesKomponenter/personlinje/queries";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";
import { statuserQuery } from "./fellesKomponenter/statuser/queries";
import type { IMeldekortStatuser } from "./fellesKomponenter/statuser/types";
import { varslerQuery } from "./fellesKomponenter/varsler/queries";
import type { IMeldekortVarsler } from "./fellesKomponenter/varsler/types";

export interface GlobalSanityData {
  header: IMeldekortHeader | null;
  personlinje: IMeldekortPersonlinje | null;
  bekreftModal: IMeldekortBekreftModal | null;
  historikkModal: IMeldekortHistorikkModal | null;
  aktiviteter: IMeldekortAktiviteter | null;
  statuser: IMeldekortStatuser | null;
  kalender: IMeldekortKalender | null;
  varsler: IMeldekortVarsler | null;
}

/**
 * Henter alle globale Sanity-data som trengs på tvers av siden.
 * Returnerer alltid et objekt, også ved feil (med null-verdier).
 */
export async function fetchGlobalSanityData(): Promise<GlobalSanityData> {
  try {
    const [
      header,
      personlinje,
      bekreftModal,
      historikkModal,
      aktiviteter,
      statuser,
      kalender,
      varsler,
    ] = await Promise.all([
      sanityClient.fetch<IMeldekortHeader>(headerQuery),
      sanityClient.fetch<IMeldekortPersonlinje>(personlinjeQuery),
      sanityClient.fetch<IMeldekortBekreftModal>(bekreftModalQuery),
      sanityClient.fetch<IMeldekortHistorikkModal>(historikkModalQuery),
      sanityClient.fetch<IMeldekortAktiviteter>(aktiviteterQuery),
      sanityClient.fetch<IMeldekortStatuser>(statuserQuery),
      sanityClient.fetch<IMeldekortKalender>(kalenderQuery),
      sanityClient.fetch<IMeldekortVarsler>(varslerQuery),
    ]);

    return {
      header,
      personlinje,
      bekreftModal,
      historikkModal,
      aktiviteter,
      statuser,
      kalender,
      varsler,
    };
  } catch (error) {
    logger.error("Kunne ikke hente globale data fra Sanity:", { error });
    return {
      header: null,
      personlinje: null,
      bekreftModal: null,
      historikkModal: null,
      aktiviteter: null,
      statuser: null,
      kalender: null,
      varsler: null,
    };
  }
}
