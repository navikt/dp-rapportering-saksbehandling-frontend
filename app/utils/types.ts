import type { SetupWorker } from "msw/browser";

import type { AKTIVITET_TYPE, OPPRETTET_AV, RAPPORTERING_TYPE, ROLLE } from "./constants";
import { RAPPORTERINGSPERIODE_STATUS } from "./constants";

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

export type TOpprettetAv = (typeof OPPRETTET_AV)[keyof typeof OPPRETTET_AV];

export type TRolle = (typeof ROLLE)[keyof typeof ROLLE];

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

export interface IKilde {
  rolle: TRolle;
  ident: string;
}

export interface IRapporteringsperiode {
  id: string;
  ident: string;
  status: TRapporteringsperiodeStatus;
  type: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  kanSendes: boolean;
  kanEndres: boolean;
  kanSendesFra: string;
  sisteFristForTrekk: string | null;
  opprettetAv: string;
  begrunnelse?: string;
  kilde: IKilde | null;
  originalMeldekortId: string | null;
  /** InnsendtTidspunkt er et ISO timestamp, og settes av backend hvis ikke frontend gjør det */
  innsendtTidspunkt: string | null;
  /** yyyy-mm-dd, dato for når meldekortet skal regnes som registrert, kan settes av saksbehandler ellers følger det av innsendtTidspunkt */
  meldedato: string | null;
  registrertArbeidssoker: boolean | null;
}

export interface ITilUtfyllingMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["TilUtfylling"];
}

export interface ISendInnMeldekort {
  ident: string;
  id: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  kanSendesFra: string;
  sisteFristForTrekk: string | null;
  opprettetAv: TOpprettetAv;
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  kilde: IKilde;
  begrunnelse: string;
  innsendtTidspunkt?: string | null;
  registrertArbeidssoker: boolean;
  meldedato: string | null;
}

export interface IKorrigerMeldekort {
  ident: string;
  originalMeldekortId: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  kilde: IKilde;
  begrunnelse: string;
  meldedato: string;
}

export interface IBrukerInnsendtMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  begrunnelse?: string;
  kilde: {
    rolle: (typeof ROLLE)["Bruker"];
    ident: string;
  };
}

export interface ISaksbehandlerInnsendtMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  begrunnelse: string;
  kilde: {
    rolle: (typeof ROLLE)["Saksbehandler"];
    ident: string;
  };
}

export type Meldekort = ISendInnMeldekort | ITilUtfyllingMeldekort;

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
  MICROSOFT_TOKEN?: string;
  IS_LOCALHOST: TrueOrFalse;
  USE_MSW: TrueOrFalse;
  NODE_ENV?: "development" | "test" | "production";
  FARO_URL: string;
}

export interface ISaksbehandler {
  onPremisesSamAccountName: string; // Dette er saksbehandlerIdent
  givenName: string;
  displayName: string;
  mail: string;
}
