export interface ITidsEnhet {
  singular: string;
  plural: string;
}

export interface IEnheter {
  hours: ITidsEnhet;
  days: ITidsEnhet;
}

export interface INumberInput {
  adjustValueAriaLabel: string;
  increaseAriaLabel: string;
  decreaseAriaLabel: string;
}

export interface IMeldekortAktivitetsTabell {
  fieldsetLegend: string;
  aktiviteterCaption: string;
  sumCaption: string;
  weekCaption: string;
  enheter: IEnheter;
  numberInput: INumberInput;
}
