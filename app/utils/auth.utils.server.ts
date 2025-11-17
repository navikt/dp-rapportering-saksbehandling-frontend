// Fra https://github.com/navikt/dp-rapportering-frontend/blob/main/app/utils/auth.utils.server.ts

import { expiresIn, getToken, requestOboToken, validateToken } from "@navikt/oasis";

import { logger } from "~/models/logger.server";

import { getEnv, isLocalhost, usesMsw } from "./env.utils";

const fallbackToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const localMeldekortregisterToken = process.env.DP_MELDEKORTREGISTER_TOKEN ?? fallbackToken;

export const DP_MELDEKORTREGISTER_AUDIENCE = `api://${process.env.NAIS_CLUSTER_NAME}.teamdagpenger.dp-meldekortregister/.default`;
export const DP_PERSONREGISTER_AUDIENCE = `api://${process.env.NAIS_CLUSTER_NAME}.teamdagpenger.dp-rapportering-personregister/.default`;

export function sessionExpiresIn(request: Request) {
  const token =
    getEnv("IS_LOCALHOST") === "true" || usesMsw ? localMeldekortregisterToken : getToken(request);

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

export async function getOnBehalfOfToken(request: Request, audience: string, fallback?: string) {
  if (isLocalhost || usesMsw) {
    return fallback ?? localMeldekortregisterToken;
  }

  const token = getToken(request);

  if (!token) {
    // Manglende token er vanligvis utgått sesjon, ikke systemfeil
    logger.info("401: Missing token in request - session likely expired");
    throw Response.json(
      {
        error: "Manglende autentisering",
        detail: "Ingen token funnet i forespørselen",
      },
      { status: 401 },
    );
  }

  const validation = await validateToken(token);

  if (!validation.ok) {
    // Token-valideringsfeil kan være utgått token (normalt) eller faktisk feil
    // Utgått token inneholder vanligvis "expired" i error-melding
    const errorMessage = validation.error?.message || String(validation.error);
    const isExpired = errorMessage.toLowerCase().includes("expired");
    if (isExpired) {
      logger.info(`401: Token expired: ${errorMessage}`);
    } else {
      logger.warn(`401: Token validation failed: ${errorMessage}`);
    }

    throw Response.json(
      {
        error: "Ugyldig autentisering",
        detail: `Failed to validate token: ${errorMessage}`,
      },
      { status: 401 },
    );
  }

  const obo = await requestOboToken(token, audience);

  if (!obo.ok) {
    // OBO-token feil er uventet og bør undersøkes
    logger.error(`401: Failed to get OBO token: ${obo.error}`, { audience });
    throw Response.json(
      {
        error: "Kunne ikke hente tilgangstoken",
        detail: `Failed to get OBO token for audience ${audience}`,
      },
      { status: 401 },
    );
  }

  return obo.token;
}
