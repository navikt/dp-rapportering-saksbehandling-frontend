import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { HeaderMeny } from "~/components/header-meny/HeaderMeny";
import styles from "~/route-styles/root.module.css";
import "@navikt/ds-css";
import { InternalHeader } from "@navikt/ds-react";
import { getEnv } from "./utils/env.utils";
import { hasSession } from "./mocks/session";
import { uuidv7 } from "uuidv7";

export async function loader({ request }: Route.LoaderArgs) {
  if (getEnv("USE_MSW") === "true" && !hasSession(request)) {
    return redirect("/", {
      headers: {
        "Set-Cookie": `sessionId=${uuidv7()}`,
      },
    });
  }

  return {
    env: {
      BASE_PATH: getEnv("BASE_PATH"),
      DP_RAPPORTERING_URL: getEnv("DP_RAPPORTERING_URL"),
      IS_LOCALHOST: getEnv("IS_LOCALHOST"),
      USE_MSW: getEnv("USE_MSW"),
      NODE_ENV: getEnv("NODE_ENV"),
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
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { env } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <InternalHeader>
          <Link to={"/"} className={styles.headerLogo}>
            <InternalHeader.Title as="h1" className={styles.pageHeader}>
              Dagpenger
            </InternalHeader.Title>
          </Link>
          <HeaderMeny saksbehandler={"saksbehandlerNavn"} antallOppgaverJegHarTilBehandling={0} />
        </InternalHeader>
        <main>{children}</main>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
