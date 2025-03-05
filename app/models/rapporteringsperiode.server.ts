import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IRapporteringsperiode } from "~/utils/types";
import { logger } from "./logger.server";

export async function hentRapporteringsperioder(
  request: Request
): Promise<IRapporteringsperiode[]> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders(request),
    });

    if (!response.ok) {
      logger.error(
        `Feil ved henting av rapporteringsperioder, status: ${response.status}, statusText: ${response.statusText}`
      );

      throw "rapportering-feilmelding-hent-perioder";
      // TODO: Logg feilmelding
    }

    const rapporteringsperioder: IRapporteringsperiode[] = await response.json();

    return rapporteringsperioder;
  } catch (error) {
    throw new Response("", {
      status: 500,
      statusText: "rapportering-feilmelding-hent-perioder",
    });
  }
}
