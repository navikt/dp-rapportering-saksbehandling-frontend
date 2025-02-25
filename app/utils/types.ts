import type { AKTIVITET_TYPE, RAPPORTERING_TYPE, RAPPORTERINGSPERIODE_STATUS } from "./constants";

declare global {
  interface Window {
    env: IEnv;
  }
}

export type TAktivitetType = (typeof AKTIVITET_TYPE)[keyof typeof AKTIVITET_TYPE];

export type TRapporteringsperiodeStatus =
  (typeof RAPPORTERINGSPERIODE_STATUS)[keyof typeof RAPPORTERINGSPERIODE_STATUS];

export type TRapporteringstype = (typeof RAPPORTERING_TYPE)[keyof typeof RAPPORTERING_TYPE];

export interface IPeriode {
  fraOgMed: string;
  tilOgMed: string;
}

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  dato: string;
  timer?: string;
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

export interface IRapporteringsperiode {
  id: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  sisteFristForTrekk: string | null;
  kanSendesFra: string;
  kanSendes: boolean;
  kanEndres: boolean;
  bruttoBelop: number | null;
  begrunnelseEndring: string | null;
  status: TRapporteringsperiodeStatus;
  mottattDato: string | null;
  registrertArbeidssoker: boolean | null;
  originalId: string | null;
  html: string | null;
  rapporteringstype: TRapporteringstype | null;
}

const boolskeVerdier = ["true", "false"] as const;

export type TrueOrFalse = (typeof boolskeVerdier)[number];

export interface IEnv {
  VITE_BASE_PATH: string;
  DP_RAPPORTERING_URL: string;
  IS_LOCALHOST: TrueOrFalse;
  USE_MSW: TrueOrFalse;
}
