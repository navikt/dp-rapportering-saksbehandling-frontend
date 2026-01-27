import groq from "groq";

export const forsideQuery = groq`*[_type == "meldekortForside"][0]{
  heading,
  welcomeText,
  sectionHeading
}`;
