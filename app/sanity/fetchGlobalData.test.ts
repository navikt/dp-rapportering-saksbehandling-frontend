import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IMeldekortAktiviteter } from "./fellesKomponenter/aktiviteter/types";
import type { IMeldekortBekreftModal } from "./fellesKomponenter/bekreft-modal/types";
import type { IMeldekortHeader } from "./fellesKomponenter/header/types";
import type { IMeldekortHistorikkModal } from "./fellesKomponenter/historikk-modal/types";
import type { IMeldekortKalender } from "./fellesKomponenter/kalender/types";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";
import type { IMeldekortStatuser } from "./fellesKomponenter/statuser/types";
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

  const mockHistorikkModalData: IMeldekortHistorikkModal = {
    overskrift: "Historikk",
    prosessAriaLabel: "Meldekort for {{aar}}",
    hendelsetyper: {
      registrert: "Registrert som arbeidssøker",
      avregistrert: "Avregistrert som arbeidssøker",
    },
    innsendt: "Innsendt: {{dato}}, kl. {{tid}}",
    typeLabels: {
      elektronisk: "Elektronisk",
      manuell: "Manuell",
    },
    tags: {
      forSentInnsendt: "Innsendt etter fristen",
      korrigert: "Korrigert",
    },
    fristLabel: "Frist: {{dato}}",
    feilmeldinger: {
      ingenData: "Fant hverken meldekort eller arbeidssøkerstatus knyttet til denne personen",
      ingenMeldekort: "Fant ingen meldekort knyttet til denne personen",
      ingenStatus: "Fant ingen arbeidssøkerstatus knyttet til denne personen",
    },
  };

  const mockAktiviteterData: IMeldekortAktiviteter = {
    jobb: {
      kort: "Jobb",
      lang: "Jobb",
    },
    syk: {
      kort: "Syk",
      lang: "Syk",
    },
    ferie: {
      kort: "Ferie",
      lang: "Ferie, fravær eller utenlandsopphold",
    },
    utdanning: {
      kort: "Utdanning",
      lang: "Tiltak, kurs eller utdanning",
    },
  };

  const mockStatuserData: IMeldekortStatuser = {
    tilUtfylling: "Klar til utfylling",
    innsendt: "Innsendt",
    meldekortOpprettet: "Meldekort opprettet",
    korrigering: "Korrigering",
    korrigert: "Korrigert",
    arena: "Arena",
  };

  const mockKalenderData: IMeldekortKalender = {
    tableCaption: "Kalender for perioden",
    weekLabel: "Uke",
    ukedager: {
      monday: { short: "Ma", long: "Mandag" },
      tuesday: { short: "Ti", long: "Tirsdag" },
      wednesday: { short: "On", long: "Onsdag" },
      thursday: { short: "To", long: "Torsdag" },
      friday: { short: "Fr", long: "Fredag" },
      saturday: { short: "Lø", long: "Lørdag" },
      sunday: { short: "Sø", long: "Søndag" },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal hente header, personlinje, bekreftModal, historikkModal, aktiviteter, statuser og kalender data", async () => {
    const { sanityClient } = await import("./client");

    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockResolvedValueOnce(mockPersonlinjeData as never)
      .mockResolvedValueOnce(mockBekreftModalData as never)
      .mockResolvedValueOnce(mockHistorikkModalData as never)
      .mockResolvedValueOnce(mockAktiviteterData as never)
      .mockResolvedValueOnce(mockStatuserData as never)
      .mockResolvedValueOnce(mockKalenderData as never);

    const result = await fetchGlobalSanityData();

    expect(result).toEqual({
      header: mockHeaderData,
      personlinje: mockPersonlinjeData,
      bekreftModal: mockBekreftModalData,
      historikkModal: mockHistorikkModalData,
      aktiviteter: mockAktiviteterData,
      statuser: mockStatuserData,
      kalender: mockKalenderData,
    });
    expect(sanityClient.fetch).toHaveBeenCalledTimes(7);
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
      historikkModal: null,
      aktiviteter: null,
      statuser: null,
      kalender: null,
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
      historikkModal: null,
      aktiviteter: null,
      statuser: null,
      kalender: null,
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
    // og returnere null for alle
    expect(result).toEqual({
      header: null,
      personlinje: null,
      bekreftModal: null,
      historikkModal: null,
      aktiviteter: null,
      statuser: null,
      kalender: null,
    });
  });

  it("skal returnere riktig type struktur", async () => {
    const { sanityClient } = await import("./client");

    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockResolvedValueOnce(mockPersonlinjeData as never)
      .mockResolvedValueOnce(mockBekreftModalData as never)
      .mockResolvedValueOnce(mockHistorikkModalData as never)
      .mockResolvedValueOnce(mockAktiviteterData as never)
      .mockResolvedValueOnce(mockStatuserData as never)
      .mockResolvedValueOnce(mockKalenderData as never);

    const result = await fetchGlobalSanityData();

    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("personlinje");
    expect(result).toHaveProperty("bekreftModal");
    expect(result).toHaveProperty("historikkModal");
    expect(result).toHaveProperty("aktiviteter");
    expect(result).toHaveProperty("statuser");
    expect(result).toHaveProperty("kalender");
    expect(typeof result).toBe("object");
  });
});
