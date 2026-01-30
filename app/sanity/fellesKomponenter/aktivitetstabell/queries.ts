import groq from "groq";

export const aktivitetstabellQuery = groq`*[_type == "meldekortAktivitetsTabell"][0]{
  fieldsetLegend,
  aktiviteterCaption,
  sumCaption,
  weekCaption,
  enheter {
    hours {
      singular,
      plural
    },
    days {
      singular,
      plural
    }
  },
  numberInput {
    adjustValueAriaLabel,
    increaseAriaLabel,
    decreaseAriaLabel
  }
}`;
