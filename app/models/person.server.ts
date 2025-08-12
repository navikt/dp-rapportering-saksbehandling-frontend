import { DP_PERSONREGISTER_AUDIENCE } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IPerson } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentPersoner(request: Request): Promise<IPerson[]> {
  try {
    const url = `${getEnv("DP_PERSONREGISTER_URL")}/sb/personer`;

    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_PERSONREGISTER_AUDIENCE }),
    });

    return await response.json();
  } catch (error) {
    logger.error(`Klarte ikke hente personer status: 500: ${error}`);

    throw new Response("Unauthorized", { status: 500 });
  }
}

export async function hentPerson(request: Request, personId: string): Promise<IPerson> {
  try {
    const url = `${getEnv("DP_PERSONREGISTER_URL")}/sb/person/${personId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_PERSONREGISTER_AUDIENCE }),
    });

    return await response.json();
  } catch (error) {
    logger.error(`Klarte ikke hente person status: 500: ${error}`);

    throw new Response("Unauthorized", { status: 500 });
  }
}
