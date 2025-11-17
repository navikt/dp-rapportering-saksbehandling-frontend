import {
  DP_MELDEKORTREGISTER_AUDIENCE,
  DP_PERSONREGISTER_AUDIENCE,
} from "~/utils/auth.utils.server";
import { getDemoParams } from "~/utils/demo-params.utils";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import { httpRequest } from "~/utils/http-client.server";
import { sorterMeldekort } from "~/utils/rapporteringsperiode.utils";
import type {
  IArbeidssokerperiode,
  IKorrigerMeldekort,
  IRapporteringsperiode,
  ISendInnMeldekort,
} from "~/utils/types";

/**
 * Henter arbeidssøkerperioder for en person
 */
export async function hentArbeidssokerperioder(
  request: Request,
  personId: string,
): Promise<IArbeidssokerperiode[]> {
  const url = `${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/${personId}`;

  return httpRequest<IArbeidssokerperiode[]>(
    url,
    {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_PERSONREGISTER_AUDIENCE }),
    },
    "Henting av arbeidssokerperioder",
    { personId },
  );
}

/**
 * Henter meldekort for en person
 */
export async function hentRapporteringsperioder(
  request: Request,
  personId: string,
): Promise<IRapporteringsperiode[]> {
  const baseUrl = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort`;

  // Legg til demo params fra original request (for testing/demo-miljø)
  const demoParams = getDemoParams(request);
  const url = new URL(baseUrl);
  Object.entries(demoParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const rapporteringsperioder = await httpRequest<IRapporteringsperiode[]>(
    url.toString(),
    {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
    },
    "Henting av rapporteringsperioder",
    { personId },
  );

  return rapporteringsperioder.sort(sorterMeldekort);
}

/**
 * Henter et spesifikt meldekort for en person
 */
export async function hentPeriode<T extends IRapporteringsperiode>(
  request: Request,
  personId: string,
  periodeId: string,
): Promise<T> {
  const baseUrl = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort/${periodeId}`;

  // Legg til demo params fra original request (for testing/demo-miljø)
  const demoParams = getDemoParams(request);
  const url = new URL(baseUrl);
  Object.entries(demoParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return httpRequest<T>(
    url.toString(),
    {
      method: "GET",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
    },
    "Henting av rapporteringsperiode",
    { personId, periodeId },
  );
}

/**
 * Oppdaterer et meldekort for en person
 */
export async function oppdaterPeriode({
  periode,
  personId,
  request,
}: {
  periode: ISendInnMeldekort;
  personId: string;
  request: Request;
}) {
  const baseUrl = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort/${periode.id}`;

  // Legg til demo params fra original request (for testing/demo-miljø)
  const demoParams = getDemoParams(request);
  const url = new URL(baseUrl);
  Object.entries(demoParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  await httpRequest(
    url.toString(),
    {
      method: "POST",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
      body: JSON.stringify(periode),
    },
    "Oppdatering av rapporteringsperiode",
    { personId, periodeId: periode.id },
  );
}

/**
 * Korrigerer et meldekort for en person
 */
export async function korrigerPeriode({
  periode,
  personId,
  request,
}: {
  periode: IKorrigerMeldekort;
  personId: string;
  request: Request;
}) {
  const baseUrl = `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${personId}/meldekort/${periode.originalMeldekortId}/korriger`;

  // Legg til demo params fra original request (for testing/demo-miljø)
  const demoParams = getDemoParams(request);
  const url = new URL(baseUrl);
  Object.entries(demoParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const responseData = await httpRequest<{ id?: string }>(
    url.toString(),
    {
      method: "POST",
      headers: await getHeaders({ request, audience: DP_MELDEKORTREGISTER_AUDIENCE }),
      body: JSON.stringify(periode),
    },
    "Korrigering av rapporteringsperiode",
    { personId, originalMeldekortId: periode.originalMeldekortId },
  );

  return responseData?.id || null;
}
