import { ScenarioType } from "~/utils/scenario.types";
import type { IPerson } from "~/utils/types";

const personData = [
  {
    scenario: ScenarioType.FULL_DEMO,
    ident: "0201020012345",
    id: "2277730",
    fornavn: "Full",
    mellomnavn: "",
    etternavn: "Demo",
    statsborgerskap: "Norsk",
  },
];

export const mockPersons: Array<IPerson & { scenario: ScenarioType }> = personData.map((person) => {
  return {
    ...person,
    scenario: ScenarioType.FULL_DEMO,
  };
});

export const getFullDemoPerson = () => {
  return mockPersons.find((person) => person.scenario === ScenarioType.FULL_DEMO);
};
