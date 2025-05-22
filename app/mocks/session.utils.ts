import { HttpResponse, type HttpResponseResolver } from "msw";

export function withSession(handler: HttpResponseResolver): HttpResponseResolver {
  return (req) => {
    const sessionId = req.cookies?.sessionId;

    const hasSession =
      typeof sessionId === "string" &&
      sessionId.trim() !== "" &&
      sessionId !== "null" &&
      sessionId !== "undefined";

    if (!hasSession) {
      return HttpResponse.json({ error: "Uautorisert: mangler sessionId" }, { status: 401 });
    }

    return handler(req);
  };
}
