import type { PortableTextBlock } from "@portabletext/types";

export interface IDatoFelt {
  label: string;
  helpText: string;
  feilmelding: string;
}

export interface IMeldekortoversikt {
  tittel: string;
  tekst: PortableTextBlock[];
  arsskifteTilleggstekst?: string;
  ukenummerKolonne: string;
  periodeKolonne: string;
  varselKolonne: string;
  overlappAriaLabel: string;
}

export interface IFeilmelding {
  tittel: string;
  tekst: string;
}

export interface IFeilmeldinger {
  simulering: IFeilmelding;
  opprettelse: IFeilmelding;
  overlappendeMeldekort: IFeilmelding;
  ingenPerioder: IFeilmelding;
}

export interface IMeldekortOpprettMeldekortModal {
  tittel: string;
  fraDato: IDatoFelt;
  tilDato: IDatoFelt;
  forklaringstekst: string;
  submitKnapp: string;
  avbrytKnapp: string;
  meldekortoversikt: IMeldekortoversikt;
  feilmeldinger: IFeilmeldinger;
}
