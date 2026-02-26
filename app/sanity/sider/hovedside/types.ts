export interface IMeldekortHovedside {
  overskrift: string;
  listeOverskrift: string;
  tabellKolonner: {
    uke: string;
    dato: string;
    status: string;
    aktiviteter: string;
    meldedato: string;
    frist: string;
  };
  utvidetVisning: {
    overskrift: string;
    emptyCardMessage: string;
    aktiviteterTittel: string;
    noActivitiesText: string;
    tabellTittel: string;
    infoLabels: {
      meldedato: string;
      datoForInnsending: string;
      datoForKorrigering: string;
      korrigertAv: string;
      innsendtAv: string;
      begrunnelse: {
        label: string;
        visMer: string;
        visMindre: string;
      };
      svarPaaArbeidssoekerregistrering: string;
      beregnetBruttobelop: string;
      periodenBeregningenGjelderFor: string;
    };
  };
  knapper: {
    korrigerMeldekort: string;
    fyllutMeldekort: string;
  };
  varsler: {
    forSentInnsendt: string;
    fraArena: string;
    korrigeringAvArenaMeldekort: string;
    etterregistrert: string;
    kanIkkeEndres: string;
    belopSamsvarerIkke: string;
  };
}
