import type { IPerson } from "./types";

export const RAPPORTERING_TYPE = {
  harAktivitet: "harAktivitet",
  harIngenAktivitet: "harIngenAktivitet",
} as const;

export const OPPRETTET_AV = {
  Arena: "Arena",
  Dagpenger: "Dagpenger",
} as const;

export const ROLLE = {
  Bruker: "Bruker",
  Saksbehandler: "Saksbehandler",
} as const;

export const RAPPORTERINGSPERIODE_STATUS = {
  TilUtfylling: "TilUtfylling",
  Innsendt: "Innsendt",
} as const;

export const AKTIVITET_TYPE = {
  Arbeid: "Arbeid",
  Syk: "Syk",
  Fravaer: "Fravaer",
  Utdanning: "Utdanning",
} as const;

// Prioriteringsrekkefølge for aktivitetskombinasjon (første treff vinner)
export const AKTIVITET_PRIORITET = [
  AKTIVITET_TYPE.Syk,
  AKTIVITET_TYPE.Fravaer,
  AKTIVITET_TYPE.Arbeid,
  AKTIVITET_TYPE.Utdanning,
] as const;

// Aktivitetslabels - kort versjon for kompakt visning (f.eks. kalender)
export const AKTIVITET_LABELS_KORT = {
  [AKTIVITET_TYPE.Arbeid]: "Jobb",
  [AKTIVITET_TYPE.Syk]: "Syk",
  [AKTIVITET_TYPE.Fravaer]: "Ferie",
  [AKTIVITET_TYPE.Utdanning]: "Utdanning",
} as const;

// Aktivitetslabels - lang versjon for skjemaer og detaljerte visninger
export const AKTIVITET_LABELS_LANG = {
  [AKTIVITET_TYPE.Arbeid]: "Jobb",
  [AKTIVITET_TYPE.Syk]: "Syk",
  [AKTIVITET_TYPE.Fravaer]: "Ferie, fravær eller utenlandsopphold",
  [AKTIVITET_TYPE.Utdanning]: "Tiltak, kurs eller utdanning",
} as const;

export const MODAL_ACTION_TYPE = {
  AVBRYT: "avbryt",
  FULLFOR: "fullfor",
} as const;

export const QUERY_PARAMS = {
  AAR: "aar",
  RAPPORTERINGSID: "rapporteringsid",
  OPPDATERT: "oppdatert",
} as const;

// Legacy-eksport for bakoverkompatibilitet - bruker lange labels
export const aktivitetsTyper = [
  {
    type: AKTIVITET_TYPE.Arbeid,
    label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Arbeid],
    erDager: false,
    klasse: "arbeid",
  },
  {
    type: AKTIVITET_TYPE.Syk,
    label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Syk],
    erDager: true,
    klasse: "syk",
  },
  {
    type: AKTIVITET_TYPE.Fravaer,
    label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Fravaer],
    erDager: true,
    klasse: "fravaer",
  },
  {
    type: AKTIVITET_TYPE.Utdanning,
    label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Utdanning],
    erDager: true,
    klasse: "utdanning",
  },
];

export const ANSVARLIG_SYSTEM = {
  ARENA: "ARENA",
  DP: "DP",
} as const;

export const KJONN = {
  MANN: "MANN",
  KVINNE: "KVINNE",
  UKJENT: "UKJENT",
} as const;

export const MELDEKORT_TYPE = {
  ETTERREGISTRERT: "Etterregistrert",
  ORDINAERT: "Ordinaert",
} as const;

export const ARBEIDSSOKERPERIODE_STATUS = {
  STARTET: "Startet",
  AVSLUTTET: "Avsluttet",
} as const;

export const DEFAULT_PERSON: IPerson = {
  ansvarligSystem: ANSVARLIG_SYSTEM.DP,
  fornavn: "",
  etternavn: "",
  kjonn: KJONN.UKJENT,
  ident: "",
};

// Behandlingsresultat https://dp-behandling.intern.dev.nav.no/openapi
export const DATA_TYPE = {
  DATO: "dato",
  DESIMALTALL: "desimaltall",
  HELTALL: "heltall",
  BOOLSK: "boolsk",
  ULID: "ulid",
  PENGER: "penger",
  INNTEKT: "inntekt",
  TEKST: "tekst",
  BARN: "barn",
  PERIODE: "periode",
} as const;

export const OPPRINNELSE = { NY: "Ny", ARVET: "Arvet" } as const;

export const ENHET = {
  TIMER: "timer",
  PROSENT: "prosent",
  G: "G",
  DAGER: "dager",
  UKER: "uker",
  MÅNEDER: "måneder",
  AAR: "år",
} as const;

export const OPPLYSNINGSKILDE_TYPE = {
  SAKSBEHANDLER: "Saksbehandler",
  SYSTEM: "System",
};

export const FORMAL = {
  REGISTER: "Register",
  BRUKER: "Bruker",
  REGEL: "Regel",
  LEGACY: "Legacy",
};

export const BEHANDLET_HENTELSE_TYPE = {
  SOKNAD: "Søknad",
  MELDEKORT: "Meldekort",
  MANUELL: "Manuell",
};
