export interface IModalTekster {
  overskrift: string;
  innhold: string;
  bekreftKnapp: string;
  avbrytKnapp: string;
}

export interface IMeldekortBekreftModal {
  avbrytUtfylling: IModalTekster;
  fullfoerUtfylling: IModalTekster;
  avbrytKorrigering: IModalTekster;
  fullfoerKorrigering: IModalTekster;
}
