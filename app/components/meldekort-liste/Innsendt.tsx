import { Tag } from "@navikt/ds-react";
import { differenceInDays, parseISO } from "date-fns";
import { formatterDato } from "~/utils/dato.utils";

interface IProps {
  mottattDato: string;
  tilOgMed: string;
}

export const SISTE_FRIST = 10; // Endre til hvor mange dager det skal være for sent

export function Innsendt({ mottattDato, tilOgMed }: IProps) {
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  if (forSent) {
    return <Tag variant="error">{formatterDato({ dato: mottattDato })}</Tag>;
  }

  return <Tag variant="neutral">{formatterDato({ dato: mottattDato })}</Tag>;
}
