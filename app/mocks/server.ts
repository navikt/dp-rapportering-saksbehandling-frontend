import { type SetupServer, setupServer } from "msw/node";

import { logger } from "~/models/logger.server";

import { mockAzure } from "./mock-azure";
import { mockBehandling } from "./mock-behandling";
import { mockMeldekortregister } from "./mock-meldekortregister";
import { mockPersonregister } from "./mock-personregister";

export const handlers = [
  ...mockAzure(),
  ...mockMeldekortregister(),
  ...mockPersonregister(),
  ...mockBehandling(),
];

export const server = setupServer(...handlers);

let isMockServerStarted = false;

export function startMockServer(server: SetupServer) {
  if (isMockServerStarted) {
    return;
  }

  isMockServerStarted = true;

  server.listen({
    onUnhandledFrame({ frame, defaults }) {
      if (frame.protocol === "http") {
        const request = frame.data.request;
        const url = new URL(request.url);

        // Ignorer Sanity API requests
        if (
          url.hostname === "sanity.io" ||
          url.hostname.endsWith(".sanity.io")
        ) {
          return;
        }

        logger.warn(`Unhandled request: ${request.url}`);
      }

      defaults.warn();
    },
  });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  logger.info("MSW server startet");
}
