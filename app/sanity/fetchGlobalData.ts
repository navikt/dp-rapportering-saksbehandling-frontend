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
 * - Matcher results til query names (ikke array-indekser) for robusthet
 * - Sanity CDN håndterer caching automatisk
 */
export async function fetchGlobalSanityData(): Promise<GlobalSanityData> {
  // Definer queries med navn og query strings
  const queries = [
    { name: "header" as const, query: headerQuery },
    { name: "personlinje" as const, query: personlinjeQuery },
    { name: "bekreftModal" as const, query: bekreftModalQuery },
    { name: "historikkModal" as const, query: historikkModalQuery },
    { name: "aktiviteter" as const, query: aktiviteterQuery },
    { name: "statuser" as const, query: statuserQuery },
    { name: "kalender" as const, query: kalenderQuery },
    { name: "varsler" as const, query: varslerQuery },
    { name: "aktivitetstabell" as const, query: aktivitetstabellQuery },
  ];

  // Kjør alle queries parallelt
  const results = await Promise.allSettled(queries.map(({ query }) => sanityClient.fetch(query)));

  // Opprett et map av query navn til resultatene deres for sikker tilgang
  const resultMap = new Map<
    string,
    | IMeldekortHeader
    | IMeldekortPersonlinje
    | IMeldekortBekreftModal
    | IMeldekortHistorikkModal
    | IMeldekortAktiviteter
    | IMeldekortStatuser
    | IMeldekortKalender
    | IMeldekortVarsler
    | IMeldekortAktivitetsTabell
    | null
  >();

  results.forEach((result, index) => {
    const queryName = queries[index].name;

    if (result.status === "rejected") {
      logger.warn(`Sanity query '${queryName}' feilet`, {
        queryName,
        error: result.reason,
      });
      resultMap.set(queryName, null);
    } else {
      resultMap.set(queryName, result.value);
    }
  });

  // Bygg retur-objekt ved å bruke map i stedet for array indices
  // Dette gjør koden robust mot endringer i query rekkefølge
  return {
    header: (resultMap.get("header") as IMeldekortHeader | null) ?? null,
    personlinje: (resultMap.get("personlinje") as IMeldekortPersonlinje | null) ?? null,
    bekreftModal: (resultMap.get("bekreftModal") as IMeldekortBekreftModal | null) ?? null,
    historikkModal: (resultMap.get("historikkModal") as IMeldekortHistorikkModal | null) ?? null,
    aktiviteter: (resultMap.get("aktiviteter") as IMeldekortAktiviteter | null) ?? null,
    statuser: (resultMap.get("statuser") as IMeldekortStatuser | null) ?? null,
    kalender: (resultMap.get("kalender") as IMeldekortKalender | null) ?? null,
    varsler: (resultMap.get("varsler") as IMeldekortVarsler | null) ?? null,
    aktivitetstabell:
      (resultMap.get("aktivitetstabell") as IMeldekortAktivitetsTabell | null) ?? null,
  };
}
