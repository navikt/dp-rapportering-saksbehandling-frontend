import { http, passthrough } from "msw";

export function mockSanity() {
  return [
    // La alle Sanity API-kall gå gjennom til det ekte API-et
    http.get("https://rt6o382n.apicdn.sanity.io/*", () => {
      return passthrough();
    }),
  ];
}
