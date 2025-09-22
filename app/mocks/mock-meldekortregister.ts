import { http, HttpResponse } from "msw";

import { logger } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { withDb } from "./db";
import { getDatabase } from "./db.utils";

export function mockMeldekortregister(database?: ReturnType<typeof withDb>) {
  return [
    http.get(`${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId`, ({ cookies, params }) => {
      const db = database || getDatabase(cookies);

      const personId = params.personId as string;
      const person = db.hentPerson(personId);

      if (!person) {
        logger.error(`[mock meldekortregister]: Fant ikke person ${personId}`);

        return HttpResponse.json(null, { status: 404 });
      }

      logger.info(`[mock meldekortregister]: Hentet person ${personId}`);

      return HttpResponse.json(person);
    }),

    http.get(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort`,
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);
        const personId = params.personId as string;
        const person = db.hentPerson(personId);

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
      ({ params, cookies }) => {
        const db = database || getDatabase(cookies);

        const meldekortId: string = params.meldekortId as string;
        const rapporteringsperiode = db.hentRapporteringsperiodeMedId(meldekortId);

        if (!rapporteringsperiode) {
          logger.error(`[mock meldekortregister]: Fant ikke rapporteringsperiode ${meldekortId}`);
          return HttpResponse.json(null, { status: 404 });
        }

        logger.info(`[mock meldekortregister]: Hentet rapporteringsperiode ${meldekortId}`);

        return HttpResponse.json(rapporteringsperiode);
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:rapporteringsperiodeId`,
      async ({ params, request, cookies }) => {
        const db = database || getDatabase(cookies);
        const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
        const oppdateringer = (await request.json()) as IRapporteringsperiode;

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!eksisterendePeriode) {
          logger.error(
            `[mock meldekortregister]: Fant ikke rapporteringsperiode ${rapporteringsperiodeId} for oppdatering`,
          );
          return HttpResponse.json(null, { status: 404 });
        }

        db.oppdaterPeriode(rapporteringsperiodeId, oppdateringer);

        logger.info(
          `[mock meldekortregister]: Oppdaterte rapporteringsperiode ${rapporteringsperiodeId}`,
        );

        return HttpResponse.json(null, { status: 200 });
      },
    ),

    http.post(
      `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/:personId/meldekort/:rapporteringsperiodeId/korriger`,
      async ({ params, request, cookies }) => {
        const db = database || getDatabase(cookies);
        const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
        const oppdateringer = (await request.json()) as IRapporteringsperiode;

        const eksisterendePeriode = db.hentRapporteringsperiodeMedId(rapporteringsperiodeId);

        if (!eksisterendePeriode) {
          logger.error(
            `[mock meldekortregister]: Fant ikke rapporteringsperiode ${rapporteringsperiodeId} for korrigering`,
          );
          return HttpResponse.json(null, { status: 404 });
        }

        const nyPeriode = db.korrigerPeriode(oppdateringer);
        db.periodeKanIkkeLengerSendes(rapporteringsperiodeId);

        logger.info(
          `[mock meldekortregister]: Oppdaterte rapporteringsperiode ${rapporteringsperiodeId}`,
        );

        return HttpResponse.json({ id: nyPeriode.id }, { status: 200 });
      },
    ),
  ];
}
