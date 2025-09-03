import { uuidv7 } from "uuidv7";

import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { ISaksbehandler } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentSaksbehandler(request: Request): Promise<ISaksbehandler> {
  try {
    const url =
      "https://graph.microsoft.com/v1.0/me/?$select=onPremisesSamAccountName,givenName,displayName,mail";

    const audience = `https://graph.microsoft.com/.default`;

    const response = await fetch(url, {
      headers: await getHeaders({ request, audience, fallbackToken: getEnv("MICROSOFT_TOKEN") }),
    });

    if (!response.ok) {
      throw new Response(`Feil ved henting av saksbehandler`, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response.json();
  } catch (error) {
    const errorId = uuidv7();

    if (error instanceof Response) {
      logger.error(`Feil ved henting av saksbehandler: ${error}`, { errorId });
      throw Response.json(
        { errorId, message: error.statusText },
        { status: error.status, statusText: error.statusText },
      );
    }

    logger.error(`Feil ved henting av saksbehandler: ${error}`, { errorId });
    throw Response.json({ errorId, message: "Feil ved henting av saksbehandler" }, { status: 500 });
  }
}
