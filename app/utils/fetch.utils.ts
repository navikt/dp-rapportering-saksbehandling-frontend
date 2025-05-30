// Fra https://github.com/navikt/dp-rapportering-frontend/blob/main/app/utils/fetch.utils.ts

import { uuidv7 } from "uuidv7";

import { getSessionId } from "../mocks/session";
import { getOnBehalfOfToken } from "./auth.utils.server";
import { isLocalOrDemo } from "./env.utils";

function generateCorrelationId() {
  // https://github.com/navikt/dp-rapportering-frontend/pull/242#pullrequestreview-2403834306
  // korralasjon_id i dp-rappoortering kan være på maks 54 tegn
  return `dp-rapp-${uuidv7()}`.substring(0, 54);
}

interface IProps {
  request: Request;
  customHeaders?: Record<string, string>;
  audience: string;
}

export async function getHeaders({ request, customHeaders = {}, audience }: IProps) {
  const onBehalfOfToken = await getOnBehalfOfToken(request, audience);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
    "X-Request-ID": generateCorrelationId(),
    connection: "keep-alive",
    Referer: request.url,
    ...customHeaders,
  };

  if (isLocalOrDemo) {
    const sessionId = getSessionId(request);

    if (sessionId) {
      return { ...headers, Cookie: `sessionId=${sessionId}` };
    }
  }

  return headers;
}
