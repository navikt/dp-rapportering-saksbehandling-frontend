import { Tag } from "@navikt/ds-react";
import { FormattertDato } from "./FormattertDato";
import { differenceInDays, parseISO } from "date-fns";

interface IProps {
  mottattDato: string;
  tilOgMed: string;
}

const SISTE_FRIST = 10; // Endre til hvor mange dager det skal være for sent

export function InnsendtDato({ mottattDato, tilOgMed }: IProps) {
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  if (forSent) {
    return (
      <Tag variant="error">
        <FormattertDato dato={mottattDato} />
      </Tag>
    );
  }

  return <FormattertDato dato={mottattDato} />;
}
