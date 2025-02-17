import { Tag } from "@navikt/ds-react";
import { FormattertDato } from "./FormattertDato";
import { differenceInDays, parseISO } from "date-fns";

export const InnsendtDato = ({
  mottattDato,
  tilOgMed,
}: {
  mottattDato: string;
  tilOgMed: string;
}) => {
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= 10; // Endre til hvor mange dager det skal være for sent

  if (forSent) {
    return (
      <Tag variant="error">
        <FormattertDato dato={mottattDato} />
      </Tag>
    );
  }

  return <FormattertDato dato={mottattDato} />;
};
