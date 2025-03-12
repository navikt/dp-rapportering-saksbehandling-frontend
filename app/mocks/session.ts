export function getSessionId(request: Request) {
  const cookieString = request.headers.get("Cookie") || "";
  const cookies = cookieString.split(";").map((cookie) => cookie.trim());

  const sessionCookie = cookies.find((cookie) => cookie.startsWith("sessionId="));

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }
  return null;
}

export function hasSession(request: Request) {
  return request.headers.get("Cookie")?.includes("sessionId");
}
