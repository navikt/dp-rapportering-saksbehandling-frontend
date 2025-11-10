import { HttpResponse, type JsonBodyType, type PathParams } from "msw";

import { withDb } from "./db";
import { sessionRecord } from "./session";

interface RequestHandler {
  request: Request;
  params: PathParams;
  cookies: Record<string, string>;
}

type CallbackArgs = {
  db: ReturnType<typeof withDb>;
  request: Request;
  params: PathParams;
};

export const withDbHandler =
  <T extends JsonBodyType>(callback: (args: CallbackArgs) => T, db?: ReturnType<typeof withDb>) =>
  async ({ cookies, request, params }: RequestHandler) => {
    const sessionId = cookies["sessionId"];

    if (db) {
      return callback({ db, request, params });
    }

    const defaultDb = sessionId ? withDb(await sessionRecord.getDatabase(sessionId)) : null;

    if (defaultDb) {
      return callback({ db: defaultDb, request, params });
    }

    return HttpResponse.json([]);
  };

export async function getDatabase(cookies: Record<string, string>) {
  const sessionId = cookies["sessionId"];

  return withDb(await sessionRecord.getDatabase(sessionId));
}
