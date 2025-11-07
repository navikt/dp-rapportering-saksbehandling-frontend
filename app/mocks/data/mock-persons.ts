import { ANSVARLIG_SYSTEM, KJONN } from "~/utils/constants";
import type { IPerson } from "~/utils/types";

const personData: Array<IPerson & { id: string }> = [
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
];

export const mockPersons: Array<IPerson & { id: string }> = personData;

export const getFullDemoPerson = () => {
  return mockPersons[0];
};
