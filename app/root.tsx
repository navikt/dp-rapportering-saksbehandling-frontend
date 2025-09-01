import "./app.css";
import "@navikt/ds-css";

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
import Header from "./components/navigasjon/header/Header";
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
      DP_MELDEKORTREGISTER_URL: getEnv("DP_MELDEKORTREGISTER_URL"),
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
  const { env, saksbehandler } = useLoaderData<typeof loader>();

  return (
    <html lang="nb">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Header saksbehandler={saksbehandler} antallOppgaverJegHarTilBehandling={2} />
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

export default function App() {
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
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
