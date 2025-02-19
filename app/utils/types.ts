export interface IPeriode {
  fraOgMed: string;
  tilOgMed: string;
}

export enum EAktivitetType {
  Arbeid = "Arbeid",
  Syk = "Syk",
  Fravaer = "Fravaer",
  Utdanning = "Utdanning",
}

export interface IAktivitet {
  id?: string;
  type: EAktivitetType;
  dato: string;
  timer?: string;
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

export enum ERapporteringsperiodeStatus {
  TilUtfylling = "TilUtfylling",
  Innsendt = "Innsendt",
  Endret = "Endret",
  Ferdig = "Ferdig",
  Feilet = "Feilet",
}

// export enum ERapporteringsperiodeStatus {
//   MeldekortOpprettet = "Meldekort opprettet",
//   BeregningUtført = "Beregning utført",
//   FeilVedBeregning = "Feil med beregning",
//   SkalIkkeBeregnes = "Skal ikke beregnes",
// }

export enum ERapporteringstype {
  harAktivitet = "harAktivitet",
  harIngenAktivitet = "harIngenAktivitet",
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
  status: ERapporteringsperiodeStatus;
  mottattDato: string | null;
  registrertArbeidssoker: boolean | null;
  originalId: string | null;
  html: string | null;
  rapporteringstype: ERapporteringstype | null;
}
