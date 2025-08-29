import type { SetupWorker } from "msw/browser";

import type { AKTIVITET_TYPE, RAPPORTERING_TYPE } from "./constants";
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
  personId: string;
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
  kilde: {
    rolle: "Bruker" | "Saksbehandler";
    ident: string;
  } | null;
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

export interface IInnsendtMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  kanSendes: false;
}

export interface IKorrigertMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  begrunnelse: string;
  originalMeldekortId: string;
  kanSendes: false;
}

export interface IBrukerInnsendtMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  begrunnelse?: string;
  kilde: {
    rolle: "Bruker";
    ident: string;
  };
}

export interface ISaksbehandlerInnsendtMeldekort extends IRapporteringsperiode {
  status: (typeof RAPPORTERINGSPERIODE_STATUS)["Innsendt"];
  begrunnelse: string;
  kilde: {
    rolle: "Saksbehandler";
    ident: string;
  };
}

export type Meldekort = IInnsendtMeldekort | ITilUtfyllingMeldekort;

export interface IPerson {
  ident: string;
  id: string;
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
  FARO_URL: string;
}

export interface ISaksbehandler {
  onPremisesSamAccountName: string; // Dette er saksbehandlerIdent
  givenName: string;
  displayName: string;
  mail: string;
}
