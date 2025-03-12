import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IPerson } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentPerson(request: Request, personId: string): Promise<IPerson> {
  try {
    const url = `${getEnv("DP_RAPPORTERING_URL")}/person/${personId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders(request),
    });

    return await response.json();
  } catch (error) {
    logger.error(`Klarte ikke hente saksbehandler status: 401: ${error}`);

    throw new Response("Unauthorized", { status: 401 });
  }
}
