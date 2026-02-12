export interface IMeldekortHistorikkModal {
  overskrift: string;
  prosessAriaLabel: string;
  hendelsetyper: {
    registrert: string;
    avregistrert: string;
  };
  innsendt: string;
  typeLabels: {
    elektronisk: string;
    manuell: string;
  };
  tags: {
    forSentInnsendt: string;
    korrigert: string;
  };
  fristLabel: string;
  feilmeldinger: {
    ingenData: string;
    ingenMeldekort: string;
    ingenStatus: string;
  };
}
