import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentRapporteringsperioder(
  request: Request
): Promise<IRapporteringsperiode[]> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  logger.info(`Henter rapporteringsperioder fra ${url}`);

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
    logger.error(`Feil ved henting av rapporteringsperioder: ${error}`);

    throw new Response("", {
      status: 500,
      statusText: "rapportering-feilmelding-hent-perioder",
    });
  }
}

export async function hentPeriode(
  request: Request,
  periodeId: string
): Promise<IRapporteringsperiode> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/${periodeId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders(request),
    });

    if (!response.ok) {
      // TODO: Logg feilmelding
      throw "rapportering-feilmelding-hent-periode";
    }

    const rapporteringsperiode: IRapporteringsperiode = await response.json();

    return rapporteringsperiode;
  } catch (error) {
    logger.error(`Feil ved henting av rapporteringsperiode: ${error}`);

    throw new Response(`rapportering-feilmelding-hent-periode`, { status: 500 });
  }
}
