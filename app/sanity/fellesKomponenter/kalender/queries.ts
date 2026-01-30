import groq from "groq";

export const kalenderQuery = groq`*[_type == "meldekortKalender"][0]{
  tableCaption,
  weekLabel,
  ukedager {
    monday {
      short,
      long
    },
    tuesday {
      short,
      long
    },
    wednesday {
      short,
      long
    },
    thursday {
      short,
      long
    },
    friday {
      short,
      long
    },
    saturday {
      short,
      long
    },
    sunday {
      short,
      long
    }
  }
}`;
