import type { SetupWorker } from "msw/browser";

import type {
  AKTIVITET_TYPE,
  KJONN,
  KORT_TYPE,
  RAPPORTERING_TYPE,
  RAPPORTERINGSPERIODE_STATUS,
} from "./constants";

declare global {
  interface Window {
    env: IEnv;
    nativeFetch: typeof fetch;
    customFetch: (url: URL, abortController: AbortController) => Promise<Response>;
    worker: SetupWorker;
  }
}

interface INetworkResponseSuccess<T> {
  status: "success";
  data?: T;
  id?: string;
}

interface INetworkResponseError {
  status: "error";
  error: {
    statusCode: number;
    statusText: string;
  };
  id?: string;
}

export type INetworkResponse<T = void> = INetworkResponseSuccess<T> | INetworkResponseError;

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

type TKortType = (typeof KORT_TYPE)[keyof typeof KORT_TYPE];

export type TKjonn = (typeof KJONN)[keyof typeof KJONN];

export interface IRapporteringsperiode {
  id: string;
  ident: string;
  type: TKortType;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  sisteFristForTrekk: string;
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
  kilde: {
    rolle: "Bruker" | "Saksbehandler";
    ident: string;
  } | null;
}

export interface ISikkerhetstiltak {
  beskrivelse: string;
  gyldigTom: string;
}

export interface IPerson {
  ident: string;
  fornavn: string;
  etternavn: string;
  mellomnavn?: string;
  kjonn: TKjonn;
  fodselsdato: string;
  alder: number;
  statsborgerskap: string;
  sikkerhetstiltak?: ISikkerhetstiltak[];
}

export const boolskeVerdier = ["true", "false"] as const;

export type TrueOrFalse = (typeof boolskeVerdier)[number];

export interface IEnv {
  DP_MELDEKORTREGISTER_URL: string;
  DP_MELDEKORTREGISTER_TOKEN?: string;
  DP_PERSONREGISTER_URL: string;
  DP_PERSONREGISTER_TOKEN?: string;
  IS_LOCALHOST: TrueOrFalse;
  USE_MSW: TrueOrFalse;
  NODE_ENV?: "development" | "test" | "production";
}

export interface ISaksbehandler {
  onPremisesSamAccountName: string; // Dette er saksbehandlerIdent
  givenName: string;
  displayName: string;
  mail: string;
}
