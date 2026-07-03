import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getDemoAction, getDemoStatus } from "~/utils/demo-params.utils";
import { getEnv } from "~/utils/env.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockMeldekortregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId`,
      async ({ cookies, params, request }) => {
        const db = database || (await getDatabase(cookies));

        const personId = params.personId as string;

        // Sjekk demo status parameter for feilsimulering
        const demoStatus = getDemoStatus(request.url);
        if (demoStatus === "404-person") {
          logger.warn(`[mock meldekortregister]: Simulerer 404-feil for person ${personId}`);
          return HttpResponse.json(
            {
              title: "Person ikke funnet",
              status: 404,
              detail: `Fant ikke person med ID ${personId}`,
              correlationId: "demo-404-person-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        if (demoStatus === "500-person") {
          logger.error(`[mock meldekortregister]: Simulerer 500-feil for person ${personId}`);
          return HttpResponse.json(
            {
              title: "Serverfeil ved henting av person",
              status: 500,
              detail:
                "Det oppstod en intern feil ved henting av person. Dette er en simulert feil for testing.",
              correlationId: "demo-500-person-error",
              errorType: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
          );
        }

        const person = db.hentPerson(personId);

        if (!person) {
          logger.error(`[mock meldekortregister]: Fant ikke person ${personId}`);

          return HttpResponse.json(
            {
              title: "Person ikke funnet",
              status: 404,
              detail: `Fant ikke person med ID ${personId}`,
              correlationId: "person-not-found-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        logger.info(`[mock meldekortregister]: Hentet person ${personId}`);

        return HttpResponse.json(person);
      },
    ),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort`,
      async ({ params, cookies, request }) => {
        const db = database || (await getDatabase(cookies));
        const personId = params.personId as string;
        const person = db.hentPerson(personId);

        // Sjekk demo status parameter for feilsimulering
        const demoStatus = getDemoStatus(request.url);
        if (demoStatus === "404-perioder") {
          logger.warn(
            `[mock meldekortregister]: Simulerer 404-feil for meldekort til person ${personId}`,
          );
          return HttpResponse.json(
            {
              title: "Meldekort ikke funnet",
              status: 404,
              detail: `Fant ikke rapporteringsperioder for person med ID ${personId}`,
              correlationId: "demo-404-perioder-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        if (demoStatus === "500-perioder") {
          logger.error(
            `[mock meldekortregister]: Simulerer 500-feil for meldekort til person ${personId}`,
          );
          return HttpResponse.json(
            {
              title: "Serverfeil ved henting av rapporteringsperioder",
              status: 500,
              detail:
                "Det oppstod en intern feil ved henting av rapporteringsperioder. Dette er en simulert feil for testing.",
              correlationId: "demo-500-perioder-error",
              errorType: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
          );
        }

        const allePerioder = db.hentAlleRapporteringsperioder();

        const rapporteringsperioder = allePerioder.filter(
          (periode) => periode.ident === person.ident,
        );

        logger.info(
          `[mock meldekortregister]: Hentet ${rapporteringsperioder.length} rapporteringsperioder for person ${personId}`,
        );

        return HttpResponse.json(rapporteringsperioder);
      },
    ),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:meldekortId`,
      async ({ params, cookies, request }) => {
        const db = database || (await getDatabase(cookies));

        const meldekortId: string = params.meldekortId as string;

        // Sjekk demo status parameter for feilsimulering
        const demoStatus = getDemoStatus(request.url);
        if (demoStatus === "404-periode") {
          logger.warn(`[mock meldekortregister]: Simulerer 404-feil for meldekort ${meldekortId}`);
          return HttpResponse.json(
            {
              title: "Meldekort ikke funnet",
              status: 404,
              detail: `Fant ikke rapporteringsperiode med ID ${meldekortId}`,
              correlationId: "demo-404-periode-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        if (demoStatus === "500-periode") {
          logger.error(`[mock meldekortregister]: Simulerer 500-feil for meldekort ${meldekortId}`);
          return HttpResponse.json(
            {
              title: "Serverfeil ved henting av rapporteringsperiode",
              status: 500,
              detail:
                "Det oppstod en intern feil ved henting av rapporteringsperiode. Dette er en simulert feil for testing.",
              correlationId: "demo-500-periode-error",
              errorType: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
          );
        }

        const rapporteringsperiode = db.hentRapporteringsperiodeMedId(meldekortId);

        if (!rapporteringsperiode) {
          logger.error(`[mock meldekortregister]: Fant ikke rapporteringsperiode ${meldekortId}`);
          return HttpResponse.json(
            {
              title: "Meldekort ikke funnet",
              status: 404,
              detail: `Fant ikke rapporteringsperiode med ID ${meldekortId}`,
              correlationId: "periode-not-found-error",
              errorType: "NOT_FOUND",
            },
            { status: 404 },
          );
        }

        logger.info(`[mock meldekortregister]: Hentet rapporteringsperiode ${meldekortId}`);

        return HttpResponse.json(rapporteringsperiode);
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:rapporteringsperiodeId`,
      async ({ params, request, cookies }) => {
        const db = database || (await getDatabase(cookies));
        const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
        const oppdateringer = (await request.json()) as IRapporteringsperiode;

        // Sjekk demo action parameter for feilsimulering
        const demoAction = getDemoAction(request.url);
        if (demoAction === "fail") {
          logger.warn(
            `[mock meldekortregister]: Simulerer feil ved innsending av meldekort ${rapporteringsperiodeId}`,
          );
          return HttpResponse.json(
            {
              title: "Innsending feilet",
              status: 500,
              detail:
                "Det oppstod en feil ved innsending av meldekort. Dette er en simulert feil for testing.",
              correlationId: "demo-action-fail-error",
              errorType: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
          );
        }

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!eksisterendePeriode) {
          logger.error(
            `[mock meldekortregister]: Fant ikke rapporteringsperiode ${rapporteringsperiodeId} for oppdatering`,
          );
          return HttpResponse.json(null, { status: 404 });
        }

        await db.oppdaterPeriode(rapporteringsperiodeId, oppdateringer);

        logger.info(
          `[mock meldekortregister]: Oppdaterte rapporteringsperiode ${rapporteringsperiodeId}`,
        );

        // Backend returnerer meldekortId for konsistens med korrigerPeriode
        return HttpResponse.json({ id: rapporteringsperiodeId }, { status: 200 });
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:rapporteringsperiodeId/korriger`,
      async ({ params, request, cookies }) => {
        const db = database || (await getDatabase(cookies));
        const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
        const oppdateringer = (await request.json()) as IRapporteringsperiode;

        // Sjekk demo action parameter for feilsimulering
        const demoAction = getDemoAction(request.url);
        if (demoAction === "fail") {
          logger.warn(
            `[mock meldekortregister]: Simulerer feil ved korrigering av meldekort ${rapporteringsperiodeId}`,
          );
          return HttpResponse.json(
            {
              title: "Korrigering feilet",
              status: 500,
              detail:
                "Det oppstod en feil ved korrigering av meldekort. Dette er en simulert feil for testing.",
              correlationId: "demo-action-fail-error",
              errorType: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
          );
        }

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!eksisterendePeriode) {
          logger.error(
            `[mock meldekortregister]: Fant ikke rapporteringsperiode ${rapporteringsperiodeId} for korrigering`,
          );
          return HttpResponse.json(null, { status: 404 });
        }

        const nyPeriode = await db.korrigerPeriode({ ...eksisterendePeriode, ...oppdateringer });
        await db.periodeKanIkkeLengerSendes(rapporteringsperiodeId);

        logger.info(
          `[mock meldekortregister]: Oppdaterte rapporteringsperiode ${rapporteringsperiodeId}`,
        );

        return HttpResponse.json({ id: nyPeriode.id }, { status: 200 });
      },
    ),
  ];
}
