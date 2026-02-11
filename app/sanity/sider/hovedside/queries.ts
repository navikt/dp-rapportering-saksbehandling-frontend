import groq from "groq";

export const hovedsideQuery = groq`*[_type == "meldekortHovedside"][0]{
  overskrift,
  listeOverskrift,
  tabellKolonner,
  utvidetVisning,
  knapper,
  varsler
}`;
