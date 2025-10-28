import "./app.css";
import "@navikt/ds-css";

import { BodyShort, Box, Heading, Link, List, Page } from "@navikt/ds-react";
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
import { EnvProvider } from "./context/env-context";
import { SaksbehandlerProvider } from "./context/saksbehandler-context";
import { getSessionId } from "./mocks/session";
import { hentSaksbehandler } from "./models/saksbehandler.server";
import { getEnv, isLocalOrDemo } from "./utils/env.utils";

export async function loader({ request }: Route.LoaderArgs) {
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

  return {
    saksbehandler,
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

  return (
    <html lang="nb">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <EnvProvider env={env}>
          <SaksbehandlerProvider>
            {saksbehandler && <Header saksbehandler={saksbehandler} />}
            {children}
            <ScrollRestoration />
            <Scripts />
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
  let stack: string | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    const { errorId, message } = error.data as { errorId: string; message: string };

    title =
      error.status === 404
        ? "Siden du leter etter eksisterer ikke"
        : "Beklager, det har skjedd en feil";
    description = `${message ?? description} ${errorId ? `Om du trenger hjelp kan du oppgi feil-ID ${errorId}.` : ""}`;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    description = error.message;
    stack = error.stack;
  }

  return (
    <Page.Block as="main" width="xl" gutters id="main-content">
      <Box paddingBlock="20 16" data-aksel-template="404-v2">
        <div>
          <Heading level="1" size="large" spacing>
            {title}
          </Heading>
          <BodyShort>{description}</BodyShort>
          <List>
            <List.Item>Bruk gjerne søket eller menyen</List.Item>
            <List.Item>
              <Link href="/">Gå til forsiden</Link>
            </List.Item>
          </List>

          {stack && (
            <pre>
              <code>{stack}</code>
            </pre>
          )}
        </div>
      </Box>
    </Page.Block>
  );
}
