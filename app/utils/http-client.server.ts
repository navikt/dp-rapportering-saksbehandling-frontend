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
}

/**
 * Parser HttpProblem fra backend response
 */
async function parseHttpProblem(response: Response): Promise<IHttpProblem | null> {
  try {
    const contentType = response.headers.get("content-type");
    const isJson =
      contentType?.includes("application/json") ||
      contentType?.includes("application/problem+json");

    if (!isJson) return null;

    const data = await response.json();
    return data.title && data.status && data.correlationId ? (data as IHttpProblem) : null;
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
): Promise<never> {
  const httpProblem = await parseHttpProblem(response);
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
  const response = await fetch(url, options);

  if (!response.ok) {
    await handleErrorResponse(response, context, metadata);
  }

  // Response er OK (200-299), parse JSON
  return response.json();
}
