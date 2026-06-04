import groq from "groq";

export const opprettMeldekortModalQuery = groq`*[_type == "opprettMeldekortModal"][0]{
  tittel,
  fraDato {
    label,
    helpText
  },
  tilDato {
    label,
    helpText
  },
  forklaringstekst,
  submitKnapp,
  avbrytKnapp,
  infoBoks {
    tittel,
    tekst
  },
  feilmelding {
    tittel,
    tekst
  }
}`;
