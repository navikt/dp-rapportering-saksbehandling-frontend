import groq from "groq";

export const varslerQuery = groq`*[_type == "meldekortVarsler"][0]{
  skjermleserStatus {
    senderInn,
    behandler,
    feilet,
    suksess
  },
  suksess {
    submittedSuccess,
    correctedSuccess
  },
  feil {
    submissionFailedTitle,
    correctionFailedTitle,
    errorText
  },
  errorBoundary {
    notFoundTitle,
    generalErrorTitle,
    defaultDescription,
    errorText
  }
}`;
