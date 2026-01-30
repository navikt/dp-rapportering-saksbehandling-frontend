import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IMeldekortBekreftModal } from "./fellesKomponenter/bekreft-modal/types";
import type { IMeldekortHeader } from "./fellesKomponenter/header/types";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";
import { fetchGlobalSanityData } from "./fetchGlobalData";

// Mock sanityClient
vi.mock("./client", () => ({
  sanityClient: {
    fetch: vi.fn(),
  },
}));

// Mock logger
vi.mock("~/models/logger.server", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("fetchGlobalSanityData", () => {
  const mockHeaderData: IMeldekortHeader = {
    skipLink: "Hopp til hovedinnhold",
    systemHeaderAriaLabel: "Systemheader",
    homeLink: "Dagpenger",
    homeLinkAriaLabel: "Gå til forsiden",
    userButtonAriaLabel: "Brukermeny for {{name}}",
    dropdownAriaLabel: "Brukerhandlinger",
    sensitiveDataSwitchLabel: "Skjul sensitive opplysninger",
    sensitiveDataSwitchDescription: "Anbefales for økt sikkerhet",
    logoutLinkText: "Logg ut",
    darkThemeActive: "Mørkt tema aktivert",
    lightThemeActive: "Lyst tema aktivert",
  };

  const mockPersonlinjeData: IMeldekortPersonlinje = {
    sectionAriaLabel: "Personinformasjon",
    birthNumberLabel: "Fødselsnummer",
    ageLabel: "Alder",
    genderLabel: "Kjønn",
    citizenshipLabel: "Statsborgerskap",
    historyButton: "Historikk",
  };

  const mockBekreftModalData: IMeldekortBekreftModal = {
    avbrytUtfylling: {
      overskrift: "Vil du avbryte utfyllingen?",
      innhold: "Hvis du avbryter, vil ikke det du har fylt ut så langt lagres",
      bekreftKnapp: "Ja, avbryt",
      avbrytKnapp: "Nei, fortsett",
    },
    fullfoerUtfylling: {
      overskrift: "Vil du fullføre utfyllingen?",
      innhold: 'Ved å trykke "Ja" vil utfyllingen sendes inn.',
      bekreftKnapp: "Ja, send inn",
      avbrytKnapp: "Nei, avbryt",
    },
    avbrytKorrigering: {
      overskrift: "Vil du avbryte korrigeringen?",
      innhold: "Hvis du avbryter, vil ikke endringene du har gjort så langt lagres",
      bekreftKnapp: "Ja, avbryt",
      avbrytKnapp: "Nei, fortsett",
    },
    fullfoerKorrigering: {
      overskrift: "Vil du fullføre korrigeringen?",
      innhold: 'Ved å trykke "Ja" vil korrigeringen sendes inn.',
      bekreftKnapp: "Ja, fullfør",
      avbrytKnapp: "Nei, avbryt",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal hente header, personlinje og bekreftModal data", async () => {
    const { sanityClient } = await import("./client");

    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockResolvedValueOnce(mockPersonlinjeData as never)
      .mockResolvedValueOnce(mockBekreftModalData as never);

    const result = await fetchGlobalSanityData();

    expect(result).toEqual({
      header: mockHeaderData,
      personlinje: mockPersonlinjeData,
      bekreftModal: mockBekreftModalData,
    });
    expect(sanityClient.fetch).toHaveBeenCalledTimes(3);
  });

  it("skal returnere null-verdier ved feil", async () => {
    const { sanityClient } = await import("./client");
    const { logger } = await import("~/models/logger.server");

    vi.mocked(sanityClient.fetch).mockRejectedValue(new Error("Sanity fetch failed"));

    const result = await fetchGlobalSanityData();

    expect(result).toEqual({
      header: null,
      personlinje: null,
      bekreftModal: null,
    });
    expect(logger.error).toHaveBeenCalledWith("Kunne ikke hente globale data fra Sanity:", {
      error: expect.any(Error),
    });
  });

  it("skal returnere null-verdier hvis sanityClient.fetch kaster feil", async () => {
    const { sanityClient } = await import("./client");

    vi.mocked(sanityClient.fetch).mockImplementation(() => {
      throw new Error("Network error");
    });

    const result = await fetchGlobalSanityData();

    expect(result).toEqual({
      header: null,
      personlinje: null,
      bekreftModal: null,
    });
  });

  it("skal kunne håndtere at kun en av fetchene feiler", async () => {
    const { sanityClient } = await import("./client");

    // Først returnerer den header data, så feiler den på personlinje
    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockRejectedValueOnce(new Error("Personlinje fetch failed"));

    const result = await fetchGlobalSanityData();

    // Siden vi bruker Promise.all, vil hele operasjonen feile
    // og returnere null for begge
    expect(result).toEqual({
      header: null,
      personlinje: null,
      bekreftModal: null,
    });
  });

  it("skal returnere riktig type struktur", async () => {
    const { sanityClient } = await import("./client");

    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockResolvedValueOnce(mockPersonlinjeData as never)
      .mockResolvedValueOnce(mockBekreftModalData as never);

    const result = await fetchGlobalSanityData();

    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("personlinje");
    expect(result).toHaveProperty("bekreftModal");
    expect(typeof result).toBe("object");
  });
});
