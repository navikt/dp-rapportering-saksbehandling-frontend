import { setupServer, type SetupServerApi } from "msw/node";
import { handlers } from "./handlers";
import { logger } from "~/models/logger.server";

export const server = setupServer(...handlers);

export const setup = () => {
  return setupServer(...handlers) as SetupServerApi;
};

export const start = (server: SetupServerApi) => {
  server.listen({ onUnhandledRequest: "warn" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  logger.info("MSW server startet");
};
