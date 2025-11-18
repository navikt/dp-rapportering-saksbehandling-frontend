import { uuidv7 } from "uuidv7";

import { DP_BEHANDLING_AUDIENCE } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IBehandling } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentBehandlinger(request: Request, fnr: string): Promise<IBehandling[]> {
  try {
    const url = `${getEnv("DP_BEHANDLING_URL")}/behandlinger/${fnr}`;

    const response = await fetch(url, {
      headers: await getHeaders({
        request,
        audience: DP_BEHANDLING_AUDIENCE,
      }),
    });

    if (!response.ok) {
      throw new Response(`Feil ved henting av behandlinger`, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response.json();
  } catch (error) {
    const errorId = uuidv7();

    if (error instanceof Response) {
      logger.error(`Feil ved henting av behandlinger: ${error}`, { errorId });
      throw Response.json(
        { errorId, message: error.statusText },
        { status: error.status, statusText: error.statusText },
      );
    }

    logger.error(`Feil ved henting av behandlinger: ${error}`, { errorId });
    throw Response.json({ errorId, message: "Feil ved henting av behandlinger" }, { status: 500 });
  }
}
