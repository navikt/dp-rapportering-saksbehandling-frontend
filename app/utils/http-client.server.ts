import { uuidv7 } from "uuidv7";

import { logger } from "~/models/logger.server";

import type { IHttpProblem } from "./types";

/**
 * HTTP-metoder som er tillatt
 */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Options for safeFetch
 */
interface SafeFetchOptions {
  method: HttpMethod;
  headers: HeadersInit;
  body?: string;
  parseJson?: boolean;
  includeErrorData?: boolean;
}

/**
 * Parser HttpProblem fra backend response
 */
async function parseHttpProblem(
  response: Response,
  includeErrorData: boolean,
): Promise<IHttpProblem | null> {
  try {
    const contentType = response.headers.get("content-type");
    const isJson =
      contentType?.includes("application/json") ||
      contentType?.includes("application/problem+json");

    if (!isJson) return null;

    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return null;

    const problem = data as Record<string, unknown>;
    const perioder = Array.isArray(problem.perioder) ? problem.perioder : undefined;
    const title = typeof problem.title === "string" ? problem.title : undefined;

    if (!title && !(includeErrorData && perioder)) return null;

    return {
      ...problem,
      type: typeof problem.type === "string" ? problem.type : "about:blank",
      title: title ?? "Kunne ikke opprette meldekort.",
      status: typeof problem.status === "number" ? problem.status : response.status,
      instance: typeof problem.instance === "string" ? problem.instance : response.url,
      errorType: typeof problem.errorType === "string" ? problem.errorType : undefined,
      correlationId: typeof problem.correlationId === "string" ? problem.correlationId : uuidv7(),
      perioder,
    };
  } catch {
    return null;
  }
}

/**
 * Logger og kaster HttpProblem-feil
 */
function throwHttpProblem(
  httpProblem: IHttpProblem,
  context: string,
  metadata?: Record<string, unknown>,
): never {
  logger.error(`HttpProblem: ${context}`, {
    correlationId: httpProblem.correlationId,
    status: httpProblem.status,
    title: httpProblem.title,
    detail: httpProblem.detail,
    errorType: httpProblem.errorType,
    ...metadata,
  });

  throw Response.json(
    {
      error: httpProblem.title,
      details: httpProblem.detail,
      correlationId: httpProblem.correlationId,
      errorType: httpProblem.errorType,
      perioder: httpProblem.perioder,
    },
    { status: httpProblem.status },
  );
}

/**
 * Logger og kaster fallback-feil
 */
function throwFallbackError(
  response: Response,
  context: string,
  metadata?: Record<string, unknown>,
): never {
  const errorId = uuidv7();

  // Lag en mer beskrivende feilmelding basert på status
  let errorMessage = response.statusText;
  if (response.status >= 500) {
    errorMessage = `Feil ved ${context.toLowerCase()}`;
  } else if (response.status === 404) {
    errorMessage = `Fant ikke ressurs ved ${context.toLowerCase()}`;
  } else if (response.status === 401 || response.status === 403) {
    errorMessage = "Du har ikke tilgang til denne ressursen";
  }

  // Bruk riktig loglevel basert på statuskode
  // 5xx = systemfeil (error), 4xx = klientfeil (warn)
  const logMessage = `${response.status} feil: ${context}`;
  const logData = {
    errorId,
    status: response.status,
    statusText: response.statusText,
    ...metadata,
  };

  if (response.status >= 500) {
    logger.error(logMessage, logData);
  } else {
    logger.warn(logMessage, logData);
  }

  throw Response.json({ error: errorMessage, correlationId: errorId }, { status: response.status });
}

/**
 * Håndterer feilresponser - delegerer til riktig handler
 */
async function handleErrorResponse(
  response: Response,
  context: string,
  metadata?: Record<string, unknown>,
  includeErrorData = false,
): Promise<never> {
  const httpProblem = await parseHttpProblem(response, includeErrorData);
  return httpProblem
    ? throwHttpProblem(httpProblem, context, metadata)
    : throwFallbackError(response, context, metadata);
}

/**
 * Gjør en HTTP-forespørsel og parser JSON-responsen automatisk
 * Kaster feil hvis responsen ikke er OK (status 200-299)
 *
 * @example
 * const data = await httpRequest<MyType>(url, { method: "GET", headers }, "Henting av data")
 */
export async function httpRequest<T>(
  url: string,
  options: SafeFetchOptions,
  context: string,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const { includeErrorData = false, ...fetchOptions } = options;
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    await handleErrorResponse(response, context, metadata, includeErrorData);
  }

  // Response er OK (200-299), parse JSON
  return response.json();
}
