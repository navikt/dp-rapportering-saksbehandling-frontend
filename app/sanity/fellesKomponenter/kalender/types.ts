export interface IUkedag {
  short: string;
  long: string;
}

export interface IMeldekortKalender {
  tableCaption: string;
  weekLabel: string;
  ukedager: {
    monday: IUkedag;
    tuesday: IUkedag;
    wednesday: IUkedag;
    thursday: IUkedag;
    friday: IUkedag;
    saturday: IUkedag;
    sunday: IUkedag;
  };
}
