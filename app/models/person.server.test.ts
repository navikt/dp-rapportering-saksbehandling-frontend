import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "./logger.server";
import { hentPerson } from "./person.server";

vi.mock("./logger.server", () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

vi.mock("~/utils/fetch.utils", () => ({
  getHeaders: vi.fn().mockResolvedValue({}),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("hentPerson", () => {
  it.each([404, 403, 500])("logger HTTP %s bare en gang med riktig loggnivå", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json(
        { title: "Feil fra backend", correlationId: "test-correlation-id" },
        { status },
      ),
    );

    await expect(hentPerson(new Request("http://localhost"), "test-person")).rejects.toMatchObject({
      status,
    });

    const expectedLogger = status >= 500 ? logger.error : logger.warn;
    const otherLogger = status >= 500 ? logger.warn : logger.error;
    expect(expectedLogger).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(String(status)),
      expect.objectContaining({
        status,
        personId: "test-person",
        errorId: "test-correlation-id",
      }),
    );
    expect(otherLogger).not.toHaveBeenCalled();
  });

  it("logger fortsatt nettverksfeil og kaster en 500-respons", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(hentPerson(new Request("http://localhost"), "test-person")).rejects.toMatchObject({
      status: 500,
    });

    expect(logger.error).toHaveBeenCalledExactlyOnceWith(
      "Feil ved henting av person: TypeError: fetch failed",
      { errorId: expect.any(String) },
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
