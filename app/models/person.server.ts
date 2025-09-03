import { uuidv7 } from "uuidv7";

import { DP_MELDEKORTREGISTER_AUDIENCE } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IPerson } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentPerson(request: Request, personId: string): Promise<IPerson> {
  try {
    const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
    });

    if (!response.ok) {
      throw new Response(`Feil ved henting av person med ID ${personId}`, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response.json();
  } catch (error) {
    const errorId = uuidv7();

    if (error instanceof Response) {
      logger.error(`Feil ved henting av person med ID ${personId}: ${error}`, { errorId });
      throw Response.json(
        { errorId, message: `Vi fant ikke personen du leter etter.` },
        { status: error.status, statusText: error.statusText },
      );
    }

    logger.error(`Feil ved henting av person: ${error}`, { errorId });
    throw Response.json({ errorId, message: "Feil ved henting av person" }, { status: 500 });
  }
}
