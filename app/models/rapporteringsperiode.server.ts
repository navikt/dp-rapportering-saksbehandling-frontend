import { uuidv7 } from "uuidv7";

import { DP_MELDEKORTREGISTER_AUDIENCE } from "~/utils/auth.utils.server";
import { getEnv, runtimeEnvironment } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import { sorterMeldekort } from "~/utils/rapporteringsperiode.utils";
import type { IKorrigerMeldekort, IRapporteringsperiode, ISendInnMeldekort } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentRapporteringsperioder(
  request: Request,
  personId: string,
): Promise<IRapporteringsperiode[]> {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
    });

    if (!response.ok) {
      throw new Response(
        `Feil ved henting av rapporteringsperioder for person med ID ${personId}`,
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
    }

    const rapporteringsperioder: IRapporteringsperiode[] = await response.json();

    const correctedIds = new Set(
      rapporteringsperioder.filter((p) => p.originalMeldekortId).map((p) => p.originalMeldekortId),
    );

    // TODO: Fjern denne etter testing
    if (runtimeEnvironment === "development") {
      return rapporteringsperioder.sort(sorterMeldekort).map((periode) => ({
        ...periode,
        kanSendes: correctedIds.has(periode.id) ? periode.kanSendes : true,
      }));
    }

    return rapporteringsperioder.sort(sorterMeldekort);
  } catch (error) {
    const errorId = uuidv7();

    if (error instanceof Response) {
      logger.error(error.statusText, { errorId });
      throw Response.json(
        { errorId, message: error.statusText },
        { status: error.status, statusText: error.statusText },
      );
    }

    const melding = `Feil ved henting av rapporteringsperioder for person med ID ${personId}: ${error}`;
    logger.error(melding, { errorId });
    throw Response.json({ errorId, message: melding }, { status: 500 });
  }
}

export async function hentPeriode<T extends IRapporteringsperiode>(
  request: Request,
  personId: string,
  periodeId: string,
): Promise<T> {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort/${periodeId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
    });

    if (!response.ok) {
      throw new Response(
        `Feil ved henting av rapporteringsperiode med ID ${periodeId} for person med ID ${personId}`,
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
    }

    const rapporteringsperiode: T = await response.json();

    // TODO: Fjern denne etter testing
    if (runtimeEnvironment === "development") {
      return { ...rapporteringsperiode, kanSendes: true };
    }
    return rapporteringsperiode;
  } catch (error) {
    const errorId = uuidv7();
    const message = `Feil ved henting av rapporteringsperiode med ID ${periodeId} for person med ID ${personId}: ${error}`;

    if (error instanceof Response) {
      logger.error(message, { errorId });
      throw Response.json(
        { errorId, message: error.statusText },
        { status: error.status, statusText: error.statusText },
      );
    }

    logger.error(message, { errorId });
    throw Response.json({ errorId, message }, { status: 500 });
  }
}

type OppdaterPeriodeProps = {
  periode: ISendInnMeldekort;
  personId: string;
  request: Request;
};

export async function oppdaterPeriode({ periode, personId, request }: OppdaterPeriodeProps) {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort/${periode.id}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
      body: JSON.stringify(periode),
    });

    if (!response.ok) {
      throw new Response(
        `Feil ved oppdatering av rapporteringsperiode med ID ${periode.id} for person med ID ${personId}`,
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
    }

    return Promise.resolve();
  } catch (error) {
    const errorId = uuidv7();
    const message = `Feil ved oppdatering av rapporteringsperiode med ID ${periode.id} for person med ID ${personId}: ${error}`;

    if (error instanceof Response) {
      logger.error(message, { errorId });
      throw Response.json(
        { errorId, message: error.statusText },
        { status: error.status, statusText: error.statusText },
      );
    }

    logger.error(message, { errorId });
    throw Response.json({ errorId, message }, { status: 500 });
  }
}

type KorrigerPeriodeProps = {
  periode: IKorrigerMeldekort;
  personId: string;
  request: Request;
};

export async function korrigerPeriode({ periode, personId, request }: KorrigerPeriodeProps) {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort/${periode.originalMeldekortId}/korriger`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
      body: JSON.stringify(periode),
    });

    if (!response.ok) {
      throw new Response(
        `Feil ved korrigering av rapporteringsperiode med ID ${periode.originalMeldekortId} for person med ID ${personId}`,
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
    }

    return Promise.resolve();
  } catch (error) {
    const errorId = uuidv7();
    const message = `Feil ved korrigering av rapporteringsperiode med ID ${periode.originalMeldekortId} for person med ID ${personId}: ${JSON.stringify(error)}`;

    if (error instanceof Response) {
      logger.error(message, { errorId });
      throw Response.json(
        { errorId, message: error.statusText },
        { status: error.status, statusText: error.statusText },
      );
    }

    logger.error(message, { errorId });
    throw Response.json({ errorId, message }, { status: 500 });
  }
}
