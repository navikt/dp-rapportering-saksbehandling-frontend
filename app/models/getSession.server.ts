import { expiresIn, getToken, parseAzureUserToken, validateToken } from "@navikt/oasis";

import { getEnv, isLocalhost, usesMsw } from "~/utils/env.utils";
import type { INetworkResponse } from "~/utils/types";

export interface ISessionData {
  expiresIn: number;
  groups: string[];
}

export async function getSession(req: Request): Promise<INetworkResponse<ISessionData>> {
  if (getEnv("IS_LOCALHOST") === "true" || usesMsw) {
    return {
      status: "success",
      data: {
        expiresIn: 18000,
        groups: [],
      },
    };
  }

  if (isLocalhost && getEnv("DP_MELDEKORTREGISTER_TOKEN")) {
    return {
      status: "success",
      data: {
        expiresIn: expiresIn(getEnv("DP_MELDEKORTREGISTER_TOKEN")),
        groups: [],
      },
    };
  }

  const token = getToken(req);

  if (!token) {
    return {
      status: "error",
      error: {
        statusCode: 401,
        statusText: "rapportering-feilmelding-token-ikke-funnet",
      },
    };
  }

  const validation = await validateToken(token);

  if (!validation.ok) {
    return {
      status: "error",
      error: {
        statusCode: 401,
        statusText: "rapportering-feilmelding-ugyldig-token",
      },
    };
  }

  const parsed = parseAzureUserToken(token);

  if (!parsed.ok || parsed.groups === undefined) {
    return {
      status: "error",
      error: {
        statusCode: 401,
        statusText: "rapportering-feilmelding-ugyldig-token",
      },
    };
  }

  return {
    status: "success",
    data: {
      expiresIn: expiresIn(token),
      groups: parsed.groups,
    },
  };
}
