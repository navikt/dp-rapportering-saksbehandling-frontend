import { ANSVARLIG_SYSTEM, KJONN } from "~/utils/constants";
import { ScenarioType } from "~/utils/scenario.types";
import type { IPerson } from "~/utils/types";

const personData: Array<IPerson & { id: string; scenario?: ScenarioType }> = [
  {
    ident: "02028212345",
    id: "2277730",
    fornavn: "Ola",
    mellomnavn: "",
    etternavn: "Nordmann",
    statsborgerskap: "Norsk",
    ansvarligSystem: ANSVARLIG_SYSTEM.DP,
    kjonn: KJONN.MANN,
    fodselsdato: "1982-02-02",
  },
  {
    ident: "03038512346",
    id: "2277731",
    fornavn: "Kari",
    mellomnavn: "",
    etternavn: "Utsatt",
    statsborgerskap: "Norsk",
    ansvarligSystem: ANSVARLIG_SYSTEM.DP,
    kjonn: KJONN.KVINNE,
    fodselsdato: "1985-03-03",
    scenario: ScenarioType.STOPPET_FOR_3_MANEDER,
  },
];

export const mockPersons: Array<IPerson & { id: string; scenario?: ScenarioType }> = personData;

export const getFullDemoPerson = () => {
  return mockPersons[0];
};
