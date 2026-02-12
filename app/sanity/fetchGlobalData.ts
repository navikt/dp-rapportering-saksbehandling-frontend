import { logger } from "~/models/logger.server";

import { sanityClient } from "./client";
import { aktiviteterQuery } from "./fellesKomponenter/aktiviteter/queries";
import type { IMeldekortAktiviteter } from "./fellesKomponenter/aktiviteter/types";
import { aktivitetstabellQuery } from "./fellesKomponenter/aktivitetstabell/queries";
import type { IMeldekortAktivitetsTabell } from "./fellesKomponenter/aktivitetstabell/types";
import { headerQuery } from "./fellesKomponenter/header/queries";
import type { IMeldekortHeader } from "./fellesKomponenter/header/types";
import { kalenderQuery } from "./fellesKomponenter/kalender/queries";
import type { IMeldekortKalender } from "./fellesKomponenter/kalender/types";
import { personlinjeQuery } from "./fellesKomponenter/personlinje/queries";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";
import { statuserQuery } from "./fellesKomponenter/statuser/queries";
import type { IMeldekortStatuser } from "./fellesKomponenter/statuser/types";
import { varslerQuery } from "./fellesKomponenter/varsler/queries";
import type { IMeldekortVarsler } from "./fellesKomponenter/varsler/types";
import { bekreftModalQuery } from "./modaler/bekreft-modal/queries";
import type { IMeldekortBekreftModal } from "./modaler/bekreft-modal/types";
import { historikkModalQuery } from "./modaler/historikk-modal/queries";
import type { IMeldekortHistorikkModal } from "./modaler/historikk-modal/types";

export interface GlobalSanityData {
  header: IMeldekortHeader | null;
  personlinje: IMeldekortPersonlinje | null;
  bekreftModal: IMeldekortBekreftModal | null;
  historikkModal: IMeldekortHistorikkModal | null;
  aktiviteter: IMeldekortAktiviteter | null;
  statuser: IMeldekortStatuser | null;
  kalender: IMeldekortKalender | null;
  varsler: IMeldekortVarsler | null;
  aktivitetstabell: IMeldekortAktivitetsTabell | null;
}

/**
 * Helper for å fetche en enkelt query med error handling
 */
async function fetchQuery<T>(
  queryName: string,
  query: string,
  fetchFn: () => Promise<T>,
): Promise<T | null> {
  try {
    return await fetchFn();
  } catch (error) {
    logger.warn(`Sanity query '${queryName}' feilet`, {
      queryName,
      error,
    });
    return null;
  }
}

/**
 * Henter alle globale Sanity-data som brukes på tvers av applikasjonen
 * (header, personlinje, kalender, aktiviteter, osv).
 *
 * Feilhåndtering:
 * - Hvis én query feiler, fortsetter de andre som normalt
 * - Feilede queries returnerer null i stedet for å krasje hele appen
 * - Komponenter bruker hardkodede default-verdier når data mangler
 *
 * Implementasjonsdetaljer:
 * - Bruker Promise.allSettled for å kjøre alle queries parallelt
 * - Type-safe per query via generics på sanityClient.fetch
 * - Sanity CDN håndterer caching automatisk
 */
export async function fetchGlobalSanityData(): Promise<GlobalSanityData> {
  // Kjør alle queries parallelt med full type-sikkerhet per query
  const [
    header,
    personlinje,
    bekreftModal,
    historikkModal,
    aktiviteter,
    statuser,
    kalender,
    varsler,
    aktivitetstabell,
  ] = await Promise.all([
    fetchQuery("header", headerQuery, () => sanityClient.fetch<IMeldekortHeader>(headerQuery)),
    fetchQuery("personlinje", personlinjeQuery, () =>
      sanityClient.fetch<IMeldekortPersonlinje>(personlinjeQuery),
    ),
    fetchQuery("bekreftModal", bekreftModalQuery, () =>
      sanityClient.fetch<IMeldekortBekreftModal>(bekreftModalQuery),
    ),
    fetchQuery("historikkModal", historikkModalQuery, () =>
      sanityClient.fetch<IMeldekortHistorikkModal>(historikkModalQuery),
    ),
    fetchQuery("aktiviteter", aktiviteterQuery, () =>
      sanityClient.fetch<IMeldekortAktiviteter>(aktiviteterQuery),
    ),
    fetchQuery("statuser", statuserQuery, () =>
      sanityClient.fetch<IMeldekortStatuser>(statuserQuery),
    ),
    fetchQuery("kalender", kalenderQuery, () =>
      sanityClient.fetch<IMeldekortKalender>(kalenderQuery),
    ),
    fetchQuery("varsler", varslerQuery, () => sanityClient.fetch<IMeldekortVarsler>(varslerQuery)),
    fetchQuery("aktivitetstabell", aktivitetstabellQuery, () =>
      sanityClient.fetch<IMeldekortAktivitetsTabell>(aktivitetstabellQuery),
    ),
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
    aktivitetstabell,
  };
}
