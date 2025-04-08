import { format } from "date-fns";

import { getKjonnFromFnr, lagPerson } from "../mock.utils";

const birthdate = new Date("1972-05-24");
const ident = `${format(birthdate, "ddMMyy")}54321`;
const kjonn = getKjonnFromFnr(ident);
const fornavn = "Anne";
const etternavn = "Hansen";

export const mockPerson = lagPerson(
  {
    kjonn,
    ident,
    fornavn,
    etternavn,
  },
  birthdate
);
