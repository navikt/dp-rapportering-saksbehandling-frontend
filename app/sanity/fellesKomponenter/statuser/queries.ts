import groq from "groq";

export const statuserQuery = groq`*[_type == "meldekortStatuser"][0]{
  tilUtfylling,
  innsendt,
  meldekortOpprettet,
  meldekortOpprettetManuelt,
  korrigering,
  korrigert,
  arena
}`;
