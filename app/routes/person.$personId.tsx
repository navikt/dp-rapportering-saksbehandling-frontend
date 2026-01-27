import { BodyShort, Heading } from "@navikt/ds-react";
import {
  isRouteErrorResponse,
  Outlet,
  redirect,
  useLoaderData,
  useRouteLoaderData,
} from "react-router";
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
import { finnBehandlingerForPerioder } from "~/utils/behandlinger.utils";
import type { IBehandlingerPerPeriode } from "~/utils/behandlingsresultat.types";
import { getEnv, usesMsw } from "~/utils/env.utils";
import { maskerPerson, skalSkjuleSensitiveOpplysninger } from "~/utils/maskering.server";
import type { IPerson } from "~/utils/types";

import type { Route } from "./+types/person.$personId";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.url.endsWith(`/person/${params.personId}`)) {
    return redirect(`/person/${params.personId}/perioder`);
  }

  invariant(params.personId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const showDemoTools = isDemoToolsEnabled();

  // Sjekk om sensitive opplysninger skal skjules
  const skjulSensitiv = skalSkjuleSensitiveOpplysninger(request);

  // Hent person først - denne trenger vi alltid for ErrorBoundary
  let person = await hentPerson(request, params.personId);

  // Masker sensitive data server-side hvis nødvendig
  if (skjulSensitiv) {
    person = maskerPerson(person);
  }

  try {
    // Prøv å hente perioder og arbeidssokerperioder
    const perioder = await hentRapporteringsperioder(request, params.personId);
    const arbeidssokerperioder = await hentArbeidssokerperioder(request, params.personId);
    let behandlingerPerPeriode: IBehandlingerPerPeriode = {};

    if (usesMsw) {
      try {
        const behandlinger = await hentBehandlinger(request, person.ident);
        behandlingerPerPeriode = finnBehandlingerForPerioder(perioder, behandlinger);
      } catch (error) {
        logger.error("Feil ved henting av behandlinger i MSW-miljø", error);
      }
    }

    return { person, perioder, arbeidssokerperioder, showDemoTools, behandlingerPerPeriode };
  } catch (error) {
    // Hvis henting av perioder feiler, legg til person-data i error response
    // slik at ErrorBoundary kan vise Personlinje
    if (error instanceof Response) {
      const originalData = await error.json();

      // Logg hele error details server-side for debugging
      logger.error("Error loading rapporteringsperioder:", {
        status: error.status,
        statusText: error.statusText,
        personId: params.personId,
        errorData: originalData,
      });

      // Send kun sanitert error data til klient
      // Person er allerede maskert hvis nødvendig, så bruk den maskerte versjonen
      throw new Response(
        JSON.stringify({
          message: originalData.message || originalData.error,
          detail: originalData.detail || originalData.details,
          errorId: originalData.errorId || originalData.correlationId,
          personContext: { person, showDemoTools },
        }),
        {
          status: error.status,
          statusText: error.statusText,
          headers: error.headers,
        },
      );
    }

    // logg uventede feil server-side
    logger.error("Unexpected error in person loader:", error);
    throw error;
  }
}

export default function Rapportering() {
  const { person, perioder, arbeidssokerperioder, showDemoTools } = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData("root");
  const personlinjeData = rootData?.sanity?.personlinje;

  return (
    <>
      <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
        <Personlinje
          person={person}
          perioder={perioder}
          arbeidssokerperioder={arbeidssokerperioder}
          personlinjeData={personlinjeData}
        />
      </aside>
      <main id="main-content" tabIndex={-1} className={styles.mainContent}>
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
  const rootData = useRouteLoaderData("root");
  const personlinjeData = rootData?.sanity?.personlinje;

  let title: string = "Det har skjedd en feil";
  let description: string = "Vi beklager, men noe gikk galt.";
  let detail: string | undefined = undefined;
  let errorId: string | undefined = undefined;
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
  } else if (error && error instanceof Error) {
    // Errors are already logged server-side in the loader before being thrown
    // Vis kun en generisk melding til klienten
    description = import.meta.env.DEV ? error.message : description;
  }

  const isDemoMode = getEnv("USE_MSW") === "true";
  const showDemoTools = personContext?.showDemoTools ?? isDemoMode;

  return (
    <>
      {personContext?.person && (
        <aside aria-label="Informasjon om valgt person" className={styles.personInformasjon}>
          <Personlinje
            person={personContext.person}
            perioder={[]}
            arbeidssokerperioder={[]}
            personlinjeData={personlinjeData}
          />
        </aside>
      )}
      <main id="main-content" tabIndex={-1} className={styles.mainContent}>
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
          </div>
        </div>
      </main>
    </>
  );
}
