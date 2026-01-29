import groq from "groq";

export const personlinjeQuery = groq`*[_type == "meldekortPersonlinje"][0]{
  sectionAriaLabel,
  birthNumberLabel,
  ageLabel,
  genderLabel,
  citizenshipLabel,
  historyButton
}`;
