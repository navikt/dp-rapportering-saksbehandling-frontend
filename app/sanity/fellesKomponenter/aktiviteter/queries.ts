import groq from "groq";

export const aktiviteterQuery = groq`*[_type == "meldekortAktiviteter"][0]{
  jobb {
    kort,
    lang
  },
  syk {
    kort,
    lang
  },
  ferie {
    kort,
    lang
  },
  utdanning {
    kort,
    lang
  }
}`;
