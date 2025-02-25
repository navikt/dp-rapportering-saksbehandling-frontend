import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { IRapporteringsperiode } from "~/utils/types";

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
      // TODO: Logg feilmelding
      throw "rapportering-feilmelding-hent-perioder";
    }

    const rapporteringsperioder: IRapporteringsperiode[] = await response.json();

    return rapporteringsperioder;
  } catch (error) {
    throw new Response(`rapportering-feilmelding-hent-perioder`, { status: 500 });
  }
}
