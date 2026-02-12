import groq from "groq";

export const historikkModalQuery = groq`*[_type == "meldekortHistorikkModal"][0]{
  overskrift,
  prosessAriaLabel,
  hendelsetyper {
    registrert,
    avregistrert
  },
  innsendt,
  typeLabels {
    elektronisk,
    manuell
  },
  tags {
    forSentInnsendt,
    korrigert
  },
  fristLabel,
  feilmeldinger {
    ingenData,
    ingenMeldekort,
    ingenStatus
  }
}`;
