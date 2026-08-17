import { startUnleash, type Unleash } from "unleash-client";

import { logger } from "~/models/logger.server";

import { getEnv, isLocalOrDemo } from "./env.utils";

export const FEATURE_TOGGLES = {
  opprettMeldekortManuelt: "dp-rapportering-saksbehandling-frontend.opprett-meldekort-manuelt",
} as const;

export type FeatureToggle = (typeof FEATURE_TOGGLES)[keyof typeof FEATURE_TOGGLES];

let klientPromise: Promise<Unleash> | null = null;
let harAdvartOmManglendeConfig = false;

function harUnleashConfig(): boolean {
  return Boolean(process.env.UNLEASH_SERVER_API_URL && process.env.UNLEASH_SERVER_API_TOKEN);
}

async function hentKlient(): Promise<Unleash> {
  if (!klientPromise) {
    const baseUrl = process.env.UNLEASH_SERVER_API_URL!.replace(/\/+$/, "");

    klientPromise = startUnleash({
      url: baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`,
      appName: "dp-rapportering-saksbehandling-frontend",
      environment: process.env.UNLEASH_SERVER_API_ENV,
      customHeaders: { Authorization: process.env.UNLEASH_SERVER_API_TOKEN! },
    });

    klientPromise.catch((error) => {
      logger.error("Kunne ikke initialisere Unleash", { error });
      klientPromise = null;
    });
  }

  return klientPromise;
}

export async function erToggleAktiv(toggle: FeatureToggle, fallback = false): Promise<boolean> {
  // Lokalt og i demo vil vi se funksjonaliteten uten å sette opp Unleash.
  if (isLocalOrDemo) {
    return true;
  }

  if (!harUnleashConfig()) {
    if (!harAdvartOmManglendeConfig) {
      harAdvartOmManglendeConfig = true;
      logger.warn("Unleash er ikke konfigurert, bruker fallback for feature toggles", {
        runtimeEnvironment: getEnv("RUNTIME_ENVIRONMENT"),
      });
    }
    return fallback;
  }

  try {
    const klient = await hentKlient();
    return klient.isEnabled(toggle);
  } catch (error) {
    logger.error("Feil ved oppslag av feature toggle, bruker fallback", { toggle, error });
    return fallback;
  }
}
