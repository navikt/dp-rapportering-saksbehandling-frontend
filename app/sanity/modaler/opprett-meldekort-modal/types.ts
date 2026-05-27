export interface IDatoFelt {
  label: string;
  helpText: string;
}

export interface IInfoBoks {
  tittel: string;
  tekst: string;
}

export interface IFeilmelding {
  tittel: string;
  tekst: string;
}

export interface IMeldekortOpprettMeldekortModal {
  tittel: string;
  fraDato: IDatoFelt;
  tilDato: IDatoFelt;
  forklaringstekst: string;
  submitKnapp: string;
  avbrytKnapp: string;
  infoBoks: IInfoBoks;
  feilmelding: IFeilmelding;
}
