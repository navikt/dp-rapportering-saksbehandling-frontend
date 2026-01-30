export interface ISkjermleserStatus {
  senderInn: string;
  behandler: string;
  feilet: string;
  suksess: string;
}

export interface ISuksessmeldinger {
  submittedSuccess: string;
  correctedSuccess: string;
}

export interface IFeilmeldinger {
  submissionFailedTitle: string;
  correctionFailedTitle: string;
  errorText: string;
}

export interface IErrorBoundary {
  notFoundTitle: string;
  generalErrorTitle: string;
  defaultDescription: string;
  errorText: string;
}

export interface IMeldekortVarsler {
  skjermleserStatus: ISkjermleserStatus;
  suksess: ISuksessmeldinger;
  feil: IFeilmeldinger;
  errorBoundary: IErrorBoundary;
}
