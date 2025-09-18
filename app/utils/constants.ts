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

export const KORT_TYPE = {
  Ordinaer: "01",
  Erstatning: "03",
  Retur: "04",
  Elektronisk: "05",
  Aap: "06",
  Ordinaer_manuell: "07",
  Maskinelt_oppdatert: "08",
  Manuell_arena: "09",
  Korrigert_elektronisk: "10",
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

export const ANSVARLIG_SYSTEM = {
  ARENA: "ARENA",
  DP: "DP",
} as const;
