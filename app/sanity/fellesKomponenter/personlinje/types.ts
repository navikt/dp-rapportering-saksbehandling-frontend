export interface IMeldekortPersonlinjeKnapp {
  label: string;
  description: string;
}

export interface IMeldekortPersonlinje {
  sectionAriaLabel: string;
  birthNumberLabel: string;
  ageLabel: string;
  genderLabel: string;
  citizenshipLabel: string;
  historyButton: string;
  createReportCardButton: IMeldekortPersonlinjeKnapp;
}
