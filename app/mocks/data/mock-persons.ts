import { ANSVARLIG_SYSTEM, KJONN } from "~/utils/constants";
import { ScenarioType } from "~/utils/scenario.types";
import type { IPerson } from "~/utils/types";

const personData = [
  {
    scenario: ScenarioType.FULL_DEMO,
    ident: "02028212345",
    id: "2277730",
    fornavn: "Full",
    mellomnavn: "",
    etternavn: "Demo",
    statsborgerskap: "Norsk",
    ansvarligSystem: ANSVARLIG_SYSTEM.DP,
    kjonn: KJONN.KVINNE,
    fodselsdato: "1982-02-02",
  },
];

export const mockPersons: Array<IPerson & { scenario: ScenarioType; id: string }> = personData.map(
  (person) => {
    return {
      ...person,
      scenario: ScenarioType.FULL_DEMO,
    };
  },
);

export const getFullDemoPerson = () => {
  return mockPersons.find((person) => person.scenario === ScenarioType.FULL_DEMO);
};
