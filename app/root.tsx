import "./app.css";

import darksideCss from "@navikt/ds-css/darkside?url";
import { BodyShort, Box, Heading, Page } from "@navikt/ds-react";
import * as React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { uuidv7 } from "uuidv7";

import type { Route } from "./+types/root";
import Header from "./components/header/Header";
import { VariantSwitcher } from "./components/variant-switcher/VariantSwitcher";
import { EnvProvider } from "./context/env-context";
import { NavigationWarningProvider } from "./context/navigation-warning-context";
import { SaksbehandlerProvider } from "./context/saksbehandler-context";
import { ToastProvider } from "./context/toast-context";
import { getSessionId } from "./mocks/session";
import { hentSaksbehandler } from "./models/saksbehandler.server";
import { fetchGlobalSanityData } from "./sanity/fetchGlobalData";
import { getEnv, isLocalOrDemo } from "./utils/env.utils";

export async function loader({ request }: Route.LoaderArgs) {
  // Sjekk for demo 404-page simulering
  const url = new URL(request.url);
  const demoStatus = url.searchParams.get("status");
  if (demoStatus === "404-page") {
    throw new Response(
      JSON.stringify({
        message: "Siden du prøver å nå eksisterer ikke",
        errorId: "demo-404-page-error",
      }),
      { status: 404, statusText: "Not Found" },
    );
  }

  const saksbehandler = await hentSaksbehandler(request);

  if (getEnv("NODE_ENV") !== "test" && isLocalOrDemo) {
    const sessionId = getSessionId(request);

    if (!sessionId) {
      return redirect("/", {
        headers: {
          "Set-Cookie": `sessionId=${uuidv7()}`,
        },
      });
    }
  }

  /**
   * Les tema fra cookie for SSR.
   * Dette gjør at serveren kan rendre med riktig tema umiddelbart,
   * og forhindrer feil tema ved sidelasting/navigering.
   *
   * Cookie settes av:
   * - Inline script i <head> (førstegangsbesøkende)
   * - setTema funksjon i SaksbehandlerContext (når bruker bytter tema)
   */
  const cookieHeader = request.headers.get("Cookie");
  const tema = cookieHeader?.match(/tema=([^;]+)/)?.[1] || null;

  const sanityData = await fetchGlobalSanityData();

  return {
    saksbehandler,
    tema,
    sanity: sanityData,
    env: {
      IS_LOCALHOST: getEnv("IS_LOCALHOST"),
      USE_MSW: getEnv("USE_MSW"),
      NODE_ENV: getEnv("NODE_ENV"),
      FARO_URL: getEnv("FARO_URL"),
    },
  };
}

export function meta() {
  return [
    {
      charset: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "Dagpenger saksbehandling" },
    {
      property: "og:title",
      content: "Dagpenger saksbehandling",
    },
    {
      name: "description",
      content: "Saksbehandlingløsning for dagpenger",
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: darksideCss,
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: `/favicon-32x32.png`,
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: `/favicon-16x16.png`,
  },
  {
    rel: "icon",
    type: "image/x-icon",
    href: `/favicon.ico`,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  const env = loaderData?.env ?? {};
  const saksbehandler = loaderData?.saksbehandler;
  const serverTema = loaderData?.tema;
  const sanityData = loaderData?.sanity;

  return (
    <html lang="nb" suppressHydrationWarning data-theme={serverTema || undefined}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/*
          Blokkerende script for å forhindre feil tema ved lasting (FOUC).
          Kjører før React hydrerer for å sette tema umiddelbart.

          For førstegangsbesøkende (ingen cookie):
          1. Les tema fra localStorage (hvis tilgjengelig)
          2. Fallback til systempreferanse (prefers-color-scheme)
          3. Sett data-theme attributt på <html> (CSS bruker dette for styling)
          4. Sett cookie for neste SSR

          For "gamle" besøkende:
          - Server har allerede satt data-theme via SSR (lest fra cookie)
          - Dette scriptet gjør ingenting (currentTheme eksisterer allerede)
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Sjekk om server allerede har satt tema via cookie
                  var currentTheme = document.documentElement.getAttribute('data-theme');
                  if (!currentTheme) {
                    // Ingen server tema, les fra localStorage
                    var tema = localStorage.getItem('tema');
                    if (!tema) {
                      tema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    document.documentElement.setAttribute('data-theme', tema);
                    // Sett cookie for neste SSR
                    document.cookie = 'tema=' + tema + '; path=/; max-age=31536000; SameSite=Lax';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <EnvProvider env={env}>
          <SaksbehandlerProvider serverTema={serverTema}>
            <NavigationWarningProvider>
              <ToastProvider>
                {saksbehandler && (
                  <Header saksbehandler={saksbehandler} headerData={sanityData?.header} />
                )}
                {children}
                <ScrollRestoration />
                <Scripts />
              </ToastProvider>
            </NavigationWarningProvider>
          </SaksbehandlerProvider>
        </EnvProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title: string = "Det har skjedd en feil";
  let description: string = "Vi beklager, men noe gikk galt.";
  let detail: string | undefined = undefined;
  let errorId: string | undefined = undefined;
  let stack: string | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    const errorData = error.data as {
      errorId?: string;
      correlationId?: string;
      message?: string;
      error?: string;
      detail?: string;
      details?: string;
    };

    title =
      error.status === 404
        ? "Siden du leter etter eksisterer ikke"
        : "Beklager, det har skjedd en feil";
    // Støtt både 'message' og 'error' som hovedmelding
    description = errorData.message || errorData.error || description;
    // Støtt både 'detail' og 'details' som detaljmelding
    detail = errorData.detail || errorData.details;
    // Støtt både 'errorId' og 'correlationId'
    errorId = errorData.errorId || errorData.correlationId;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    description = error.message;
    stack = error.stack;
  }

  // Sjekk om vi er i demo-miljø (MSW aktivert)
  // getEnv bruker import.meta.env som fallback, så det fungerer selv utenfor EnvProvider
  const isDemoMode = getEnv("USE_MSW") === "true";

  return (
    <>
      <Page.Block as="main" width="xl" gutters id="main-content" tabIndex={-1}>
        <Box paddingBlock="20 16" data-aksel-template="404-v2">
          <div>
            {isDemoMode && (
              <div style={{ position: "fixed", top: "5rem", right: "1rem", zIndex: 1000 }}>
                <VariantSwitcher />
              </div>
            )}
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
              <pre
                style={{ marginTop: "2rem", padding: "1rem", background: "var(--ax-bg-sunken)" }}
              >
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </Box>
      </Page.Block>
    </>
  );
}
