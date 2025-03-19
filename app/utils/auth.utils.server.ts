// Fra https://github.com/navikt/dp-rapportering-frontend/blob/main/app/utils/auth.utils.server.ts

import { expiresIn, getToken, requestOboToken, validateToken } from "@navikt/oasis";

import { logger } from "~/models/logger.server";

import { getEnv, isLocalhost, usesMsw } from "./env.utils";

const fallbackToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const localToken = process.env.DP_MELDEKORTREGISTER_TOKEN ?? fallbackToken;

export const DP_MELDEKORTREGISTER_AUDIENCE = `${process.env.NAIS_CLUSTER_NAME}:teamdagpenger:dp-meldekortregister`;
export const DP_PERSONREGISTER_AUDIENCE = `${process.env.NAIS_CLUSTER_NAME}:teamdagpenger:dp-personregister`;
export const MICROSOFT_AUDIENCE = `https://graph.microsoft.com/.default`;

export function sessionExpiresIn(request: Request) {
  const token = getEnv("IS_LOCALHOST") === "true" || usesMsw ? localToken : getToken(request);

  if (!token) {
    return 0;
  }

  try {
    return expiresIn(token);
    // eslint-disable-next-line
  } catch (e: unknown) {
    return 0;
  }
}

export async function getOnBehalfOfToken(request: Request, audience: string) {
  if (isLocalhost || usesMsw) {
    return localToken;
  }

  const token = getToken(request);

  if (!token) {
    logger.error("Missing token");
    throw new Response("Missing token", { status: 401 });
  }

  const validation = await validateToken(token);

  if (!validation.ok) {
    logger.error(`Failed to validate token: ${validation.error}`);
    throw new Response("Token validation failed", { status: 401 });
  }

  const obo = await requestOboToken(token, audience);

  if (!obo.ok) {
    logger.error(`Failed to get OBO token: ${obo.error}`);
    throw new Response("Unauthorized", { status: 401 });
  }

  return obo.token;
}
