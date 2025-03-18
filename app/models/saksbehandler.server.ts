import { MICROSOFT_AUDIENCE } from "~/utils/auth.utils.server";
import { getHeaders } from "~/utils/fetch.utils";
import type { ISaksbehandler } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentSaksbehandler(request: Request): Promise<ISaksbehandler> {
  try {
    const url =
      "https://graph.microsoft.com/v1.0/me/?$select=onPremisesSamAccountName,givenName,displayName,mail";

    const data = await fetch(url, {
      headers: await getHeaders({ request, audience: MICROSOFT_AUDIENCE }),
    });

    return await data.json();
  } catch (error) {
    logger.error(`Klarte ikke hente saksbehandler status: 401: ${error}`);

    throw new Response("Unauthorized", { status: 401 });
  }
}
