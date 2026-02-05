import { logger } from "~/models/logger.server";

import { sanityClient } from "./client";
import { aktiviteterQuery } from "./fellesKomponenter/aktiviteter/queries";
import type { IMeldekortAktiviteter } from "./fellesKomponenter/aktiviteter/types";
import { aktivitetstabellQuery } from "./fellesKomponenter/aktivitetstabell/queries";
import type { IMeldekortAktivitetsTabell } from "./fellesKomponenter/aktivitetstabell/types";
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
  aktivitetstabell: IMeldekortAktivitetsTabell | null;
}

/**
 * Henter alle globale Sanity-data som trengs på tvers av siden.
 * Returnerer alltid et objekt, også ved feil (med null-verdier).
 *
 * Bruker Promise.allSettled for å sikre at individuelle feil ikke
 * påvirker andre queries. Hvis en query feiler, vil kun den returnere null.
 */
export async function fetchGlobalSanityData(): Promise<GlobalSanityData> {
  const queries = [
    { name: "header", query: headerQuery },
    { name: "personlinje", query: personlinjeQuery },
    { name: "bekreftModal", query: bekreftModalQuery },
    { name: "historikkModal", query: historikkModalQuery },
    { name: "aktiviteter", query: aktiviteterQuery },
    { name: "statuser", query: statuserQuery },
    { name: "kalender", query: kalenderQuery },
    { name: "varsler", query: varslerQuery },
    { name: "aktivitetstabell", query: aktivitetstabellQuery },
  ];

  const results = await Promise.allSettled(queries.map(({ query }) => sanityClient.fetch(query)));

  // Log individuelle feil for bedre feilsøking
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.warn(`Sanity query '${queries[index].name}' feilet`, {
        queryName: queries[index].name,
        error: result.reason,
      });
    }
  });

  return {
    header: results[0].status === "fulfilled" ? results[0].value : null,
    personlinje: results[1].status === "fulfilled" ? results[1].value : null,
    bekreftModal: results[2].status === "fulfilled" ? results[2].value : null,
    historikkModal: results[3].status === "fulfilled" ? results[3].value : null,
    aktiviteter: results[4].status === "fulfilled" ? results[4].value : null,
    statuser: results[5].status === "fulfilled" ? results[5].value : null,
    kalender: results[6].status === "fulfilled" ? results[6].value : null,
    varsler: results[7].status === "fulfilled" ? results[7].value : null,
    aktivitetstabell: results[8].status === "fulfilled" ? results[8].value : null,
  };
}
