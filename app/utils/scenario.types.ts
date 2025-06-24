export enum ScenarioType {
  BEREGNING_FEILET = "beregning_feilet",
  KORRIGERT_AV_BRUKER = "korrigert_av_bruker",
  KORRIGERT_AV_SAKSBEHANDLER = "korrigert_av_saksbehandler",
  SENDT_FOR_SENT = "sendt_for_sent",
  IKKE_SENDT_INN = "ikke_sendt_inn",
  FLERE_BEREGNEDE = "flere_beregnede",
  FULL_DEMO = "FULL_DEMO",
}

export interface IScenario {
  type: ScenarioType;
  tittel: string;
}

export const SCENARIOS: IScenario[] = [
  {
    type: ScenarioType.BEREGNING_FEILET,
    tittel: "Meldekort med beregningsfeil",
  },
  {
    type: ScenarioType.KORRIGERT_AV_BRUKER,
    tittel: "Meldekort korrigert av bruker",
  },
  {
    type: ScenarioType.KORRIGERT_AV_SAKSBEHANDLER,
    tittel: "Meldekort korrigert av saksbehandler",
  },
  {
    type: ScenarioType.SENDT_FOR_SENT,
    tittel: "Meldekort sendt etter fristen",
  },
  {
    type: ScenarioType.IKKE_SENDT_INN,
    tittel: "Meldekort som ikke er sendt inn",
  },
  {
    type: ScenarioType.FLERE_BEREGNEDE,
    tittel: "Alle meldekortene er beregnet",
  },
];
