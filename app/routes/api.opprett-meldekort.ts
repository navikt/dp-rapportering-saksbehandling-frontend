import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { logger } from "~/models/logger.server";
import { opprettMeldekort } from "~/models/rapporteringsperiode.server";
import { getTodayIsoDate } from "~/utils/dato.utils";

const requestSchema = z.object({
  personId: z.string().min(1),
  fraOgMed: z.iso.date(),
  tilOgMed: z.iso.date(),
  simulering: z.literal(["true", "false"]).transform((value) => value === "true"),
});

export async function loader() {
  return Response.json(
    { error: "Endpointet krever POST.", status: 405 },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Endpointet krever POST.", status: 405 },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  try {
    const formData = await request.formData();
    const parsed = requestSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return Response.json(
        { error: "Ugyldig forespørsel.", detail: parsed.error.issues[0]?.message, status: 422 },
        { status: 422 },
      );
    }

    const input = parsed.data;

    logger.info("[api.opprett-meldekort] Mottok opprett-foresporsel", {
      personId: input.personId,
      fraOgMed: input.fraOgMed,
      tilOgMed: input.tilOgMed,
      simulering: input.simulering,
    });

    if (input.fraOgMed > input.tilOgMed) {
      return Response.json(
        { error: "Fra-dato må være før eller lik til-dato.", status: 422 },
        { status: 422 },
      );
    }

    const today = getTodayIsoDate();
    if (input.fraOgMed > today || input.tilOgMed > today) {
      return Response.json(
        { error: "Fra-dato og til-dato kan ikke være frem i tid.", status: 422 },
        { status: 422 },
      );
    }

    const result = await opprettMeldekort({
      request,
      personId: input.personId,
      fraOgMed: input.fraOgMed,
      tilOgMed: input.tilOgMed,
      simulering: input.simulering,
    });

    logger.info("[api.opprett-meldekort] Opprett meldekort fullfort", {
      personId: input.personId,
      antallPerioder: result.perioder?.length ?? 0,
      simulering: input.simulering,
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof Response) {
      const data = await error.json().catch(() => ({}));

      logger.error("[api.opprett-meldekort] Opprett meldekort feilet med response", {
        status: error.status,
        error: data.error,
        detail: data.details ?? data.detail,
        correlationId: data.correlationId,
      });

      return Response.json(
        {
          error: data.error ?? data.title ?? "Kunne ikke opprette meldekort.",
          detail: data.details ?? data.detail,
          correlationId: data.correlationId,
          perioder: data.perioder,
          status: error.status,
        },
        { status: error.status },
      );
    }

    logger.error("[api.opprett-meldekort] Opprett meldekort feilet uventet", error);

    return Response.json({ error: "Kunne ikke opprette meldekort.", status: 500 }, { status: 500 });
  }
}
