export const RAPPORTERING_TYPE = {
  harAktivitet: "harAktivitet",
  harIngenAktivitet: "harIngenAktivitet",
} as const;

export const RAPPORTERINGSPERIODE_STATUS = {
  TilUtfylling: "TilUtfylling",
  Innsendt: "Innsendt",
  Korrigert: "Korrigert",
  Ferdig: "Ferdig",
  Feilet: "Feilet",
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

export const KJONN = {
  MANN: "MANN",
  KVINNE: "KVINNE",
  UKJENT: "UKJENT",
};
