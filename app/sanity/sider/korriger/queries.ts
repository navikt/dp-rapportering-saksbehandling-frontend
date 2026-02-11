import groq from "groq";

export const korrigerQuery = groq`*[_type == "meldekortKorriger"][0]{
  overskrift,
  underoverskrift,
  gjeldendeMeldekort {
    overskrift,
    innsendtDato,
    begrunnelseOverskrift {
      korrigering,
      manuellInnsending
    }
  },
  korrigeringsskjema {
    overskrift,
    skjermleserHint,
    datovelgerLabel,
    begrunnelseLabel,
    begrunnelseFeilmelding
  },
  knapper {
    avbryt,
    fullfoer
  },
  skjermleserStatus {
    senderInn,
    behandler,
    feilet,
    suksess
  }
}`;
