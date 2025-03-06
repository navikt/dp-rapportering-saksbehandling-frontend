import { setupServer, type SetupServerApi } from "msw/node";
import { handlers } from "./handlers";
import { logger } from "~/models/logger.server";

export const server = setupServer(...handlers);

export const setup = () => {};

export function startMockServer() {
  const server = setupServer(...handlers) as SetupServerApi;

  server.listen({
    onUnhandledRequest(request, print) {
      logger.warn(`Unhandled request: ${request.url}`);
      print.warning();
    },
  });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  logger.info("MSW server startet");
}
