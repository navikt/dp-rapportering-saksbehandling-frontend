import { format } from "date-fns";

import { ScenarioType } from "~/utils/scenario.types";
import type { IPerson } from "~/utils/types";

import { lagPerson } from "../mock.utils";

const personData = [
  {
    scenario: ScenarioType.FULL_DEMO,
    fornavn: "Full",
    etternavn: "Demo",
    birthdate: new Date("2000-01-02"),
    pnr: "12345",
  },
];

export const mockPersons: Array<IPerson & { scenario: ScenarioType }> = personData.map((data) => {
  const ident = `${format(data.birthdate, "ddMMyy")}${data.pnr}`;

  const person = lagPerson(
    {
      ident,
      fornavn: data.fornavn,
      etternavn: data.etternavn,
    },
    data.birthdate,
  );

  return {
    ...person,
    scenario: data.scenario,
  };
});

export const getPersonByScenario = (scenario: ScenarioType): IPerson | undefined => {
  return mockPersons.find((person) => person.scenario === scenario);
};

export const getScenarioForPerson = (personId: string): ScenarioType | undefined => {
  const person = mockPersons.find((p) => p.ident === personId);
  return person?.scenario;
};
