import { format } from "date-fns";

import { ScenarioType } from "~/utils/scenario.types";
import type { IPerson } from "~/utils/types";

import { lagPerson } from "../mock.utils";

const personData = [
  {
    scenario: ScenarioType.BEREGNING_FEILET,
    fornavn: "Lars",
    etternavn: "Eriksen",
    birthdate: new Date("1985-03-15"),
    pnr: "12345",
  },
  {
    scenario: ScenarioType.KORRIGERT_AV_BRUKER,
    fornavn: "Kari",
    etternavn: "Johansen",
    birthdate: new Date("1978-11-02"),
    pnr: "67890",
  },
  {
    scenario: ScenarioType.KORRIGERT_AV_SAKSBEHANDLER,
    fornavn: "Per",
    etternavn: "Andersen",
    birthdate: new Date("1990-07-18"),
    pnr: "24680",
  },
  {
    scenario: ScenarioType.SENDT_FOR_SENT,
    fornavn: "Lise",
    etternavn: "Nilsen",
    birthdate: new Date("1983-09-30"),
    pnr: "13579",
  },
  {
    scenario: ScenarioType.IKKE_SENDT_INN,
    fornavn: "Ole",
    etternavn: "Larsen",
    birthdate: new Date("1975-12-08"),
    pnr: "86420",
  },
  {
    scenario: ScenarioType.FLERE_BEREGNEDE,
    fornavn: "Eva",
    etternavn: "Svendsen",
    birthdate: new Date("1988-04-12"),
    pnr: "97531",
  },
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
