// Fra https://github.com/navikt/dp-rapportering-frontend/blob/main/app/utils/fetch.utils.ts

import { uuidv7 } from "uuidv7";

import { getSessionId } from "../mocks/session";
import { audienceDPRapportering, getOnBehalfOfToken } from "./auth.utils.server";
import { isLocalhost } from "./env.utils";

function generateCorralationId() {
  // https://github.com/navikt/dp-rapportering-frontend/pull/242#pullrequestreview-2403834306
  // korralasjon_id i dp-rappoortering kan være på maks 54 tegn
  return `dp-rapp-${uuidv7()}`.substring(0, 54);
}

export async function getHeaders(request: Request, customHeaders = {}) {
  const onBehalfOfToken = await getOnBehalfOfToken(request, audienceDPRapportering);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
    "X-Request-ID": generateCorralationId(),
    connection: "keep-alive",
    Referer: request.url,
    ...customHeaders,
  };

  if (isLocalhost) {
    return { ...headers, Cookie: `sessionId=${getSessionId(request)}` };
  }

  return headers;
}
