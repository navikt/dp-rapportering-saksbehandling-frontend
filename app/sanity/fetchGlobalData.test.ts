import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IMeldekortAktiviteter } from "./fellesKomponenter/aktiviteter/types";
import type { IMeldekortAktivitetsTabell } from "./fellesKomponenter/aktivitetstabell/types";
import type { IMeldekortHeader } from "./fellesKomponenter/header/types";
import type { IMeldekortKalender } from "./fellesKomponenter/kalender/types";
import type { IMeldekortPersonlinje } from "./fellesKomponenter/personlinje/types";
import type { IMeldekortStatuser } from "./fellesKomponenter/statuser/types";
import type { IMeldekortVarsler } from "./fellesKomponenter/varsler/types";
import { fetchGlobalSanityData } from "./fetchGlobalData";
import type { IMeldekortBekreftModal } from "./modaler/bekreft-modal/types";
import type { IMeldekortHistorikkModal } from "./modaler/historikk-modal/types";

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
    warn: vi.fn(),
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

  const mockVarslerData: IMeldekortVarsler = {
    skjermleserStatus: {
      senderInn: "Sender inn meldekort...",
      behandler: "Behandler meldekort...",
      feilet: "Innsending feilet",
      suksess: "Meldekort sendt inn",
    },
    suksess: {
      submittedSuccess: "Meldekort er sendt inn",
      correctedSuccess: "Meldekort er korrigert",
    },
    feil: {
      submissionFailedTitle: "Kunne ikke sende inn meldekort",
      correctionFailedTitle: "Kunne ikke korrigere meldekort",
      errorText: "Om du trenger hjelp kan du oppgi feil-ID: {{id}}",
    },
    errorBoundary: {
      notFoundTitle: "Siden finnes ikke",
      generalErrorTitle: "Noe gikk galt",
      defaultDescription: "Vi klarte ikke å laste siden",
      errorText: "Om du trenger hjelp kan du oppgi feil-ID: {{id}}",
    },
  };

  const mockAktivitetstabellData: IMeldekortAktivitetsTabell = {
    fieldsetLegend: "Før opp aktiviteter",
    aktiviteterCaption: "Aktivitetstype",
    sumCaption: "Sum",
    weekCaption: "Uke {{ukenummer}}",
    enheter: {
      hours: {
        singular: "time",
        plural: "timer",
      },
      days: {
        singular: "dag",
        plural: "dager",
      },
    },
    numberInput: {
      adjustValueAriaLabel: "Juster verdi",
      increaseAriaLabel: "Øk",
      decreaseAriaLabel: "Reduser",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal hente header, personlinje, bekreftModal, historikkModal, aktiviteter, statuser, kalender, varsler og aktivitetstabell data", async () => {
    const { sanityClient } = await import("./client");

    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockResolvedValueOnce(mockPersonlinjeData as never)
      .mockResolvedValueOnce(mockBekreftModalData as never)
      .mockResolvedValueOnce(mockHistorikkModalData as never)
      .mockResolvedValueOnce(mockAktiviteterData as never)
      .mockResolvedValueOnce(mockStatuserData as never)
      .mockResolvedValueOnce(mockKalenderData as never)
      .mockResolvedValueOnce(mockVarslerData as never)
      .mockResolvedValueOnce(mockAktivitetstabellData as never);

    const result = await fetchGlobalSanityData();

    expect(result).toEqual({
      header: mockHeaderData,
      personlinje: mockPersonlinjeData,
      bekreftModal: mockBekreftModalData,
      historikkModal: mockHistorikkModalData,
      aktiviteter: mockAktiviteterData,
      statuser: mockStatuserData,
      kalender: mockKalenderData,
      varsler: mockVarslerData,
      aktivitetstabell: mockAktivitetstabellData,
    });
    expect(sanityClient.fetch).toHaveBeenCalledTimes(9);
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
      varsler: null,
      aktivitetstabell: null,
    });
    // Med Promise.allSettled logges hver feilende query individuelt
    expect(logger.warn).toHaveBeenCalledTimes(9);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Sanity query"), {
      queryName: expect.any(String),
      error: expect.any(Error),
    });
  });

  it("skal returnere null-verdier hvis sanityClient.fetch kaster feil", async () => {
    const { sanityClient } = await import("./client");
    const { logger } = await import("~/models/logger.server");

    vi.mocked(sanityClient.fetch).mockRejectedValue(new Error("Network error"));

    const result = await fetchGlobalSanityData();

    expect(result).toEqual({
      header: null,
      personlinje: null,
      bekreftModal: null,
      historikkModal: null,
      aktiviteter: null,
      statuser: null,
      kalender: null,
      varsler: null,
      aktivitetstabell: null,
    });
    expect(logger.warn).toHaveBeenCalledTimes(9);
  });

  it("skal kunne håndtere at kun en av fetchene feiler", async () => {
    const { sanityClient } = await import("./client");
    const { logger } = await import("~/models/logger.server");

    // Mock 9 queries: header lykkes, personlinje feiler, resten lykkes
    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce(mockHeaderData as never)
      .mockRejectedValueOnce(new Error("Personlinje fetch failed"))
      .mockResolvedValueOnce(mockBekreftModalData as never)
      .mockResolvedValueOnce(mockHistorikkModalData as never)
      .mockResolvedValueOnce(mockAktiviteterData as never)
      .mockResolvedValueOnce(mockStatuserData as never)
      .mockResolvedValueOnce(mockKalenderData as never)
      .mockResolvedValueOnce(mockVarslerData as never)
      .mockResolvedValueOnce(mockAktivitetstabellData as never);

    const result = await fetchGlobalSanityData();

    // Med Promise.allSettled får vi partial success:
    // kun personlinje feiler, resten returnerer data
    expect(result).toEqual({
      header: mockHeaderData,
      personlinje: null,
      bekreftModal: mockBekreftModalData,
      historikkModal: mockHistorikkModalData,
      aktiviteter: mockAktiviteterData,
      statuser: mockStatuserData,
      kalender: mockKalenderData,
      varsler: mockVarslerData,
      aktivitetstabell: mockAktivitetstabellData,
    });

    // Kun én feil skal logges (personlinje)
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith("Sanity query 'personlinje' feilet", {
      queryName: "personlinje",
      error: expect.any(Error),
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
      .mockResolvedValueOnce(mockKalenderData as never)
      .mockResolvedValueOnce(mockVarslerData as never)
      .mockResolvedValueOnce(mockAktivitetstabellData as never);

    const result = await fetchGlobalSanityData();

    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("personlinje");
    expect(result).toHaveProperty("bekreftModal");
    expect(result).toHaveProperty("historikkModal");
    expect(result).toHaveProperty("aktiviteter");
    expect(result).toHaveProperty("statuser");
    expect(result).toHaveProperty("kalender");
    expect(result).toHaveProperty("varsler");
    expect(result).toHaveProperty("aktivitetstabell");
    expect(typeof result).toBe("object");
  });
});
