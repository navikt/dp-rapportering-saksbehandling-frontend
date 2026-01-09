import { type Faro, getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

import { getEnv } from "~/utils/env.utils";

let faro: Faro | null = null;

export function initFaro() {
  if (typeof document === "undefined" || faro !== null) {
    return;
  }

  const isLocalhost = getEnv<string>("IS_LOCALHOST") === "true";
  const faroUrl = getEnv<string>("FARO_URL");

  console.log("[Faro] Initializing with:", { isLocalhost, faroUrl, paused: isLocalhost });

  faro = initializeFaro({
    paused: isLocalhost,
    url: faroUrl,
    app: {
      name: "dp-rapportering-saksbehandling-frontend",
    },
    sessionTracking: {
      enabled: true,
      persistent: true,
    },
    instrumentations: [
      ...getWebInstrumentations({ captureConsole: true }),

      new TracingInstrumentation({}),
    ],
  });
}
