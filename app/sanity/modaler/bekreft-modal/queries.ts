import groq from "groq";

export const bekreftModalQuery = groq`*[_type == "meldekortBekreftModal"][0]{
  avbrytUtfylling {
    overskrift,
    innhold,
    bekreftKnapp,
    avbrytKnapp
  },
  fullfoerUtfylling {
    overskrift,
    innhold,
    bekreftKnapp,
    avbrytKnapp
  },
  avbrytKorrigering {
    overskrift,
    innhold,
    bekreftKnapp,
    avbrytKnapp
  },
  fullfoerKorrigering {
    overskrift,
    innhold,
    bekreftKnapp,
    avbrytKnapp
  }
}`;
