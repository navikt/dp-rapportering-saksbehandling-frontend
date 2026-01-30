export interface IMeldekortKorriger {
  overskrift: string;
  underoverskrift: string;
  gjeldendeMeldekort: {
    overskrift: string;
    innsendtDato: string;
    begrunnelseOverskrift: {
      korrigering: string;
      manuellInnsending: string;
    };
  };
  korrigeringsskjema: {
    overskrift: string;
    skjermleserHint: string;
    datovelgerLabel: string;
    begrunnelseLabel: string;
    begrunnelseFeilmelding: string;
  };
  knapper: {
    avbryt: string;
    fullfoer: string;
  };
  skjermleserStatus: {
    senderInn: string;
    behandler: string;
    feilet: string;
    suksess: string;
  };
}
