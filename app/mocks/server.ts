import { setupServer, type SetupServerApi } from "msw/node";

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

export function startMockServer(server: SetupServerApi) {
  server.listen({
    onUnhandledRequest(request, print) {
      // La Sanity-requests gå gjennom uten warning
      const url = new URL(request.url);
      if (url.hostname.endsWith(".sanity.io") || url.hostname === "sanity.io") {
        return;
      }

      logger.warn(`Unhandled request: ${request.url}`);
      print.warning();
    },
  });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  logger.info("MSW server startet");
}
