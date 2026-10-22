import type { ActionFunctionArgs } from "react-router";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

import { logger } from "~/models/logger.server";
import { korrigerPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { QUERY_PARAMS } from "~/utils/constants";
import { addDemoParamsToURL } from "~/utils/demo-params.utils";
import { korrigerMeldekortSchema, sendInnMeldekortSchema } from "~/utils/meldekort.schema";
import type { IKorrigerMeldekort, ISendInnMeldekort } from "~/utils/types";

const nonEmptyString = z.string().trim().min(1);
const periodeSchema = z.union([
  korrigerMeldekortSchema,
  sendInnMeldekortSchema.extend({
    originalMeldekortId: z.null().optional(),
  }),
]);

const requestSchema = z.object({
  personId: nonEmptyString,
  rapporteringsperiode: z
    .string()
    .transform((value, context): unknown => {
      try {
        return JSON.parse(value);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        context.addIssue({ code: "custom", message: "Ugyldig JSON i rapporteringsperiode." });
        return z.NEVER;
      }
    })
    .pipe(periodeSchema),
});

export function loader() {
  return Response.json(
    { error: true, title: "Endepunktet krever POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return loader();
  }

  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      logger.warn("[api.rapportering] Kunne ikke lese skjemadata");
      return Response.json({ error: true, title: "Ugyldige skjemadata." }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      logger.warn("[api.rapportering] Ugyldig forespørsel", {
        paths: parsed.error.issues.map((issue) => issue.path.join(".")),
      });
      return Response.json(
        { error: true, title: "Ugyldig forespørsel.", detail: parsed.error.issues[0]?.message },
        { status: 422 },
      );
    }

    const { personId, rapporteringsperiode: periode } = parsed.data;

    let oppdatertId: string;

    if (typeof periode.originalMeldekortId !== "string") {
      // Dette er en oppdatering av et meldekort som er TilUtfylling
      const oppdatertPeriode: ISendInnMeldekort = periode;

      await oppdaterPeriode({
        periode: oppdatertPeriode,
        personId,
        request,
      });

      oppdatertId = periode.id;
    } else {
      // Dette er en korrigering av et innsendt meldekort
      // Frontend sender allerede IKorrigerMeldekort, men vi må generere nye aktivitet-IDer
      const korrigertPeriode: IKorrigerMeldekort = {
        ...periode,
        dager: periode.dager.map((dag) => ({
          ...dag,
          // Databasen krever en unik ID for hver aktivitet, og vi kan ikke gjenbruke orginal ID ved korrigering
          aktiviteter: dag.aktiviteter.map((aktivitet) => ({ ...aktivitet, id: uuidv7() })),
        })),
      };

      const nyMeldekortId = await korrigerPeriode({
        periode: korrigertPeriode,
        personId,
        request,
      });

      // brukes for å visuelt highlighte meldekortet som har blitt sendt inn i periodelisten
      oppdatertId = nyMeldekortId || periode.originalMeldekortId;
    }

    // Returner success med redirect URL - frontend vil håndtere redirect etter toast
    const url = new URL(`/person/${personId}/perioder`, request.url);
    url.searchParams.set(
      QUERY_PARAMS.AAR,
      new Date(periode.periode.fraOgMed).getFullYear().toString(),
    );
    url.searchParams.set(QUERY_PARAMS.RAPPORTERINGSID, oppdatertId);
    url.searchParams.set(QUERY_PARAMS.OPPDATERT, oppdatertId);
    addDemoParamsToURL(url, request);

    return Response.json({ success: true, redirectUrl: url.pathname + url.search });
  } catch (error) {
    logger.error("[api.rapportering] Innsending feilet", error);
    // Returner feil som JSON istedenfor å kaste - dette lar frontend håndtere med toast
    let errorTitle = "Innsending feilet";
    let errorDetail: string | undefined;
    let correlationId: string | undefined;

    if (error instanceof Response) {
      // httpRequest kaster Response-objekter ved feil
      try {
        const errorData = await error.json();
        errorTitle = errorData.error || errorData.title || errorTitle;
        errorDetail = errorData.detail || errorData.details;
        correlationId = errorData.correlationId;
      } catch {
        errorTitle = error.statusText || errorTitle;
      }
    } else if (error instanceof Error) {
      errorTitle = error.message;
    }

    return Response.json({
      error: true,
      title: errorTitle,
      detail: errorDetail,
      correlationId,
    });
  }
}
