import { DP_MELDEKORTREGISTER_AUDIENCE } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { logger } from "./logger.server";

export async function hentRapporteringsperioder(
  request: Request,
  personId: string
): Promise<IRapporteringsperiode[]> {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/person/${personId}/rapporteringsperioder`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
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
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode/${periodeId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
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

export async function korrigerPeriode(request: Request, periode: IRapporteringsperiode) {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
      body: JSON.stringify(periode),
    });

    if (!response.ok) {
      throw "rapportering-feilmelding-korriger-periode";
    }
  } catch (error) {
    logger.error(`Feil ved henting av rapporteringsperiode: ${error}`);
    throw new Response("rapportering-feilmelding-hent-periode", { status: 500 });
  }
}

export async function oppdaterPeriode(
  request: Request,
  periodeId: string,
  oppdateringer: Partial<IRapporteringsperiode>
) {
  const url = `${getEnv("DP_MELDEKORTREGISTER_URL")}/rapporteringsperiode/${periodeId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
      body: JSON.stringify(oppdateringer),
    });

    if (!response.ok) {
      throw "rapportering-feilmelding-oppdater-periode";
    }

    const oppdatertPeriode: IRapporteringsperiode = await response.json();
    return oppdatertPeriode;
  } catch (error) {
    logger.error(`Feil ved oppdatering av rapporteringsperiode: ${error}`);
    throw new Response("rapportering-feilmelding-oppdater-periode", { status: 500 });
  }
}
