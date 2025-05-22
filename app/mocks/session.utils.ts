import { HttpResponse, type HttpResponseResolver } from "msw";

import { getEnv } from "~/utils/env.utils";

export function withSession(handler: HttpResponseResolver): HttpResponseResolver {
  return (req) => {
    const sessionId = req.cookies?.sessionId;

    const hasSession =
      typeof sessionId === "string" &&
      sessionId.trim() !== "" &&
      sessionId !== "null" &&
      sessionId !== "undefined";

    if (!hasSession && getEnv("NODE_ENV") !== "test") {
      return HttpResponse.json({ error: "Uautorisert: mangler sessionId" }, { status: 401 });
    }

    return handler(req);
  };
}
