import { http, HttpResponse } from "msw";

import { mockSaksbehandler } from "./data/mock-saksbehandler";

export const mockAzure = [
  http.get("https://graph.microsoft.com/v1.0/me/", () => {
    return HttpResponse.json(mockSaksbehandler);
  }),
];
