export interface IMeldekortFyllUt {
  overskrift: string;
  underoverskrift: string;
  infovarsler: {
    arenaVarsel: string;
    etterregistrertVarsel: string;
  };
  utfyllingsskjema: {
    datovelgerLabel: string;
    arbeidssoekerSpoersmaal: {
      tittel: string;
      ja: string;
      nei: string;
    };
    begrunnelseLabel: string;
  };
  feilmeldinger: {
    datovelgerFeil: string;
    arbeidssoekerFeil: string;
    begrunnelseFeil: string;
  };
  knapper: {
    avbryt: string;
    sendInn: string;
  };
}
