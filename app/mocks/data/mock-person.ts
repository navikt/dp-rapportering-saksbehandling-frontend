import type { IPerson, ISikkerhetstiltak } from "~/utils/types";

export const mockSikkerhetstiltak: ISikkerhetstiltak[] = [
  { beskrivelse: "To i samtale", gyldigTom: "2025-12-01" },
  { beskrivelse: "Ikke fysisk", gyldigTom: "2025-12-01" },
];

export const mockPerson: IPerson = {
  alder: 74,
  fodselsdato: "12.01.1954",
  kjonn: "MANN",
  statsborgerskap: "Norsk",
  fornavn: "Donald",
  mellomnavn: "Dægg",
  etternavn: "Duck",
  ident: "12345678910",
  sikkerhetstiltak: mockSikkerhetstiltak,
};
