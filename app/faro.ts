import { type Faro, getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

import { getEnv, isLocalhost } from "~/utils/env.utils";

let faro: Faro | null = null;

export function initFaro() {
  if (typeof document === "undefined" || faro !== null) {
    return;
  }

  const faroUrl = getEnv<string>("FARO_URL");
  const githubSha = getEnv<string>("GITHUB_SHA");

  console.log("[Faro] Initializing with:", { isLocalhost, faroUrl });

  faro = initializeFaro({
    paused: isLocalhost,
    url: faroUrl,
    app: {
      name: "dp-rapportering-saksbehandling-frontend",
      version: githubSha || "local",
    },
    beforeSend: (item) => {
      if (item.meta?.page?.url) {
        try {
          const url = new URL(item.meta.page.url);
          url.search = "";
          url.hash = "";
          item.meta.page.url = url.toString();
        } catch {
          /* ignore */
        }
      }

      return item;
    },
    sessionTracking: {
      enabled: true,
      persistent: true,
    },
    instrumentations: [
      ...getWebInstrumentations({ captureConsole: true }),

      new TracingInstrumentation({
        instrumentationOptions: {
          propagateTraceHeaderCorsUrls: [/https:\/\/[^/]+\.nav\.no\/.*/],
        },
      }),
    ],
  });
}
