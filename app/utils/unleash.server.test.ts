import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/models/logger.server", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const startUnleashMock = vi.hoisted(() => vi.fn());

vi.mock("unleash-client", () => ({
  startUnleash: startUnleashMock,
}));

async function importerModul() {
  vi.resetModules();
  return import("./unleash.server");
}

function mockEnv(overstyringer: { isLocalOrDemo: boolean }) {
  vi.doMock("~/utils/env.utils", () => ({
    isLocalOrDemo: overstyringer.isLocalOrDemo,
    getEnv: () => "development",
  }));
}

const OPPRINNELIG_ENV = { ...process.env };

beforeEach(() => {
  startUnleashMock.mockReset();
  delete process.env.UNLEASH_SERVER_API_URL;
  delete process.env.UNLEASH_SERVER_API_TOKEN;
  delete process.env.UNLEASH_SERVER_API_ENV;
});

afterEach(() => {
  process.env = { ...OPPRINNELIG_ENV };
  vi.doUnmock("~/utils/env.utils");
});

describe("erToggleAktiv", () => {
  it("skal returnere true lokalt og i demo uten å kontakte Unleash", async () => {
    mockEnv({ isLocalOrDemo: true });
    const { erToggleAktiv, FEATURE_TOGGLES } = await importerModul();

    await expect(erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt)).resolves.toBe(true);
    expect(startUnleashMock).not.toHaveBeenCalled();
  });

  it("skal bruke fallback når Unleash ikke er konfigurert", async () => {
    mockEnv({ isLocalOrDemo: false });
    const { erToggleAktiv, FEATURE_TOGGLES } = await importerModul();

    await expect(erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt)).resolves.toBe(false);
    await expect(erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt, true)).resolves.toBe(true);
    expect(startUnleashMock).not.toHaveBeenCalled();
  });

  it("skal returnere verdien fra Unleash når den er konfigurert", async () => {
    process.env.UNLEASH_SERVER_API_URL = "https://teamdagpenger-unleash-api.nav.cloud.nais.io";
    process.env.UNLEASH_SERVER_API_TOKEN = "hemmelig";
    process.env.UNLEASH_SERVER_API_ENV = "development";

    const isEnabled = vi.fn().mockReturnValue(true);
    startUnleashMock.mockResolvedValue({ isEnabled });

    mockEnv({ isLocalOrDemo: false });
    const { erToggleAktiv, FEATURE_TOGGLES } = await importerModul();

    await expect(erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt)).resolves.toBe(true);
    expect(isEnabled).toHaveBeenCalledWith(FEATURE_TOGGLES.opprettMeldekortManuelt);
  });

  it("skal bruke URL-en fra nais som den er", async () => {
    process.env.UNLEASH_SERVER_API_URL = "https://teamdagpenger-unleash-api.nav.cloud.nais.io/api";
    process.env.UNLEASH_SERVER_API_TOKEN = "hemmelig";
    startUnleashMock.mockResolvedValue({ isEnabled: vi.fn().mockReturnValue(false) });

    mockEnv({ isLocalOrDemo: false });
    const { erToggleAktiv, FEATURE_TOGGLES } = await importerModul();
    await erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt);

    expect(startUnleashMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://teamdagpenger-unleash-api.nav.cloud.nais.io/api",
        appName: "dp-rapportering-saksbehandling-frontend",
      }),
    );
  });

  it("skal bruke fallback hvis Unleash ikke svarer", async () => {
    process.env.UNLEASH_SERVER_API_URL = "https://teamdagpenger-unleash-api.nav.cloud.nais.io";
    process.env.UNLEASH_SERVER_API_TOKEN = "hemmelig";
    startUnleashMock.mockRejectedValue(new Error("ECONNRESET"));

    mockEnv({ isLocalOrDemo: false });
    const { erToggleAktiv, FEATURE_TOGGLES } = await importerModul();

    await expect(erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt)).resolves.toBe(false);
    await expect(erToggleAktiv(FEATURE_TOGGLES.opprettMeldekortManuelt, true)).resolves.toBe(true);
  });
});
