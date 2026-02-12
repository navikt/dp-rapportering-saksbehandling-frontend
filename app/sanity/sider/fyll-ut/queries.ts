import groq from "groq";

export const fyllUtQuery = groq`*[_type == "meldekortFyllUt"][0]{
  overskrift,
  underoverskrift,
  infovarsler,
  utfyllingsskjema,
  feilmeldinger,
  knapper
}`;
