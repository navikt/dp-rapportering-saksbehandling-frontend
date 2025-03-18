import { expiresIn, getToken, validateToken } from "@navikt/oasis";

import { getEnv, isLocalhost } from "~/utils/env.utils";
import type { INetworkResponse } from "~/utils/types";

export interface ISessionData {
  expiresIn: number;
}

export async function getSession(req: Request): Promise<INetworkResponse<ISessionData>> {
  if (getEnv("IS_LOCALHOST") === "true" || getEnv("USE_MSW") === "true") {
    return {
      status: "success",
      data: {
        expiresIn: 18000,
      },
    };
  }

  if (isLocalhost && getEnv("DP_MELDEKORTREGISTER_TOKEN")) {
    return {
      status: "success",
      data: {
        expiresIn: expiresIn(getEnv("DP_MELDEKORTREGISTER_TOKEN")),
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

  return {
    status: "success",
    data: {
      expiresIn: expiresIn(token),
    },
  };
}
