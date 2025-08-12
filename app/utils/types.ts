import type { SetupWorker } from "msw/browser";

import type { AKTIVITET_TYPE, RAPPORTERING_TYPE, RAPPORTERINGSPERIODE_STATUS } from "./constants";

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

export interface IRapporteringsperiode {
  begrunnelse: string; // TODO: må avklare om dette er riktig approach
  id: string;
  ident: string;
  status: TRapporteringsperiodeStatus;
  type: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  kanSendes: boolean;
  kanEndres: boolean;
  kanSendesFra: string;
  sisteFristForTrekk: string;
  opprettetAv: string;
  korrigering: {
    korrigererMeldekortId: string;
    begrunnelse: string;
  } | null;
  kilde: {
    rolle: "Bruker" | "Saksbehandler";
    ident: string;
  } | null;
  innsendtTidspunkt: string | null;
  registrertArbeidssoker: boolean | null;
}

export interface IPerson {
  ident: string;
  fornavn: string;
  etternavn: string;
  mellomnavn?: string;
  statsborgerskap: string;
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
