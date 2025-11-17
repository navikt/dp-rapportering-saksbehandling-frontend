import { uuidv7 } from "uuidv7";

import { DP_MELDEKORTREGISTER_AUDIENCE } from "~/utils/auth.utils.server";
import { getDemoParams } from "~/utils/demo-params.utils";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IPerson } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentPerson(request: Request, personId: string): Promise<IPerson> {
  try {
    const baseUrl = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}`;

    // Legg til demo params fra original request (for testing/demo-miljø)
    const demoParams = getDemoParams(request);
    const url = new URL(baseUrl);
    Object.entries(demoParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
    });

    if (!response.ok) {
      const errorId = uuidv7();

      // Les error data fra response hvis tilgjengelig
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // Ingen JSON error data tilgjengelig
      }

      // Lag spesifikk feilmelding basert på status
      let message: string;
      if (response.status === 404) {
        message = `Feil ved henting av person med ID ${personId}`;
        // 404 er forventet feil (feil person-ID i URL), ikke systemfeil
        logger.warn(`404: ${message}`, {
          errorId: errorData?.correlationId || errorId,
          personId,
          status: response.status,
        });
      } else if (response.status >= 500) {
        // 5xx er systemfeil som må undersøkes
        message = errorData?.title || `Feil ved henting av person`;
        logger.error(`${response.status} feil ved henting av person`, {
          errorId: errorData?.correlationId || errorId,
          personId,
          status: response.status,
          statusText: response.statusText,
        });
      } else {
        // Andre klientfeil (4xx)
        message = errorData?.title || `Feil ved henting av person`;
        logger.warn(`${response.status} feil ved henting av person`, {
          errorId: errorData?.correlationId || errorId,
          personId,
          status: response.status,
          statusText: response.statusText,
        });
      }

      throw new Response(
        JSON.stringify({
          errorId: errorData?.correlationId || errorId,
          message,
          detail: errorData?.detail,
        }),
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
    }

    return response.json();
  } catch (error) {
    const errorId = uuidv7();

    if (error instanceof Response) {
      logger.error(`Feil ved henting av person med ID ${personId}: ${error}`, { errorId });
      throw error;
    }

    logger.error(`Feil ved henting av person: ${error}`, { errorId });
    throw Response.json({ errorId, message: "Feil ved henting av person" }, { status: 500 });
  }
}
