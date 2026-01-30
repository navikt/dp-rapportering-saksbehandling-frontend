export interface IAktivitetTekst {
  kort: string;
  lang: string;
}

export interface IMeldekortAktiviteter {
  jobb: IAktivitetTekst;
  syk: IAktivitetTekst;
  ferie: IAktivitetTekst;
  utdanning: IAktivitetTekst;
}
