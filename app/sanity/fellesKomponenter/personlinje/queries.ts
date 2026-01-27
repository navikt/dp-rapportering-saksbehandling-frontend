import groq from "groq";

export const personlineQuery = groq`*[_type == "meldekortPersonlinje"][0]{
  sectionAriaLabel,
  birthNumberLabel,
  ageLabel,
  genderLabel,
  citizenshipLabel,
  historyButton
}`;
