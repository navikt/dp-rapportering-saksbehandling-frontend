import groq from "groq";

export const statuserQuery = groq`*[_type == "meldekortStatuser"][0]{
  tilUtfylling,
  innsendt,
  meldekortOpprettet,
  korrigering,
  korrigert,
  arena
}`;
