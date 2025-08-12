import { format } from "date-fns";

import { lagPerson } from "../mock.utils";

const birthdate = new Date("1972-05-24");
const ident = `${format(birthdate, "ddMMyy")}54321`;
const fornavn = "Anne";
const etternavn = "Hansen";

export const mockPerson = lagPerson(
  {
    ident,
    fornavn,
    etternavn,
  },
  birthdate,
);
