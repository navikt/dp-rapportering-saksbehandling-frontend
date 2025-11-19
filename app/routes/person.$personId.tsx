import { BodyShort, Heading } from "@navikt/ds-react";
import { isRouteErrorResponse, Outlet, redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import Personlinje from "~/components/personlinje/Personlinje";
import { VariantSwitcher } from "~/components/variant-switcher/VariantSwitcher";
import { hentBehandlinger } from "~/models/behandling.server";
import { logger } from "~/models/logger.server";
import { hentPerson } from "~/models/person.server";
import {
  hentArbeidssokerperioder,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import styles from "~/styles/route-styles/root.module.css";
import { isDemoToolsEnabled } from "~/utils/ab-test.server";
import type { IBehandlingsresultat } from "~/utils/behandlingsresultat.types";
import { getEnv } from "~/utils/env.utils";
import type { IPerson } from "~/utils/types";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/perioder`);
  }

  invariant(params.personId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const showDemoTools = isDemoToolsEnabled();

  // Hent person først - denne trenger vi alltid for ErrorBoundary
  const person = await hentPerson(request, params.personId);

  try {
    // Prøv å hente perioder og arbeidssokerperioder
    const perioder = await hentRapporteringsperioder(request, params.personId);
    const arbeidssokerperioder = await hentArbeidssokerperioder(request, params.personId);
    let behandlinger: IBehandlingsresultat[] = [];

    if (getEnv("USE_MSW")) {
      try {
        behandlinger = await hentBehandlinger(request, person.ident);
      } catch (error) {
        logger.error("Feil ved henting av behandlinger i MSW-miljø", error);
      }
    }

    return { person, perioder, arbeidssokerperioder, showDemoTools, behandlinger };
  } catch (error) {
    // Hvis henting av perioder feiler, legg til person-data i error response
    // slik at ErrorBoundary kan vise Personlinje
    if (error instanceof Response) {
      const originalData = await error.json();
      throw new Response(
        JSON.stringify({
          ...originalData,
          personContext: { person, showDemoTools },
        }),
        {
          status: error.status,
          statusText: error.statusText,
          headers: error.headers,
        },
      );
    }
    throw error;
  }
}

export default function Rapportering() {
  const { person, perioder, arbeidssokerperioder, showDemoTools } = useLoaderData<typeof loader>();

  return (
    <>
      <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
        <Personlinje
          person={person}
          perioder={perioder}
          arbeidssokerperioder={arbeidssokerperioder}
        />
      </aside>
      <main id="main-content" className={styles.mainContent}>
        {showDemoTools && (
          <div className={styles.variantSwitcherContainer}>
            <VariantSwitcher />
          </div>
        )}
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title: string = "Det har skjedd en feil";
  let description: string = "Vi beklager, men noe gikk galt.";
  let detail: string | undefined = undefined;
  let errorId: string | undefined = undefined;
  let stack: string | undefined = undefined;
  let personContext: { person: IPerson; showDemoTools: boolean } | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    const errorData = error.data as {
      errorId?: string;
      correlationId?: string;
      message?: string;
      error?: string;
      detail?: string;
      details?: string;
      personContext?: { person: IPerson; showDemoTools: boolean };
    };

    title =
      error.status === 404 ? "Fant ikke det du leter etter" : "Beklager, det har skjedd en feil";
    // Støtt både 'message' og 'error' som hovedmelding
    description = errorData.message || errorData.error || description;
    // Støtt både 'detail' og 'details' som detaljmelding
    detail = errorData.detail || errorData.details;
    // Støtt både 'errorId' og 'correlationId'
    errorId = errorData.errorId || errorData.correlationId;

    // Hent person context fra error data hvis tilgjengelig
    personContext = errorData.personContext;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    description = error.message;
    stack = error.stack;
  }

  const isDemoMode = getEnv("USE_MSW") === "true";
  const showDemoTools = personContext?.showDemoTools ?? isDemoMode;

  return (
    <>
      {personContext?.person && (
        <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
          <Personlinje person={personContext.person} perioder={[]} arbeidssokerperioder={[]} />
        </aside>
      )}
      <main id="main-content" className={styles.mainContent}>
        {showDemoTools && (
          <div className={styles.variantSwitcherContainer}>
            <VariantSwitcher />
          </div>
        )}
        <div className={styles.contentWrapper}>
          <div style={{ padding: "2rem" }}>
            <Heading level="1" size="large" spacing>
              {title}
            </Heading>
            <BodyShort spacing>{description}</BodyShort>
            {detail && <BodyShort spacing>{detail}</BodyShort>}
            {errorId && (
              <BodyShort size="small">
                Om du trenger hjelp kan du oppgi feil-ID: {errorId}
              </BodyShort>
            )}

            {stack && (
              <pre style={{ marginTop: "2rem", padding: "1rem", background: "#f5f5f5" }}>
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
