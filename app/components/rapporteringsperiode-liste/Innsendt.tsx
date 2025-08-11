import { Tag } from "@navikt/ds-react";
import { differenceInDays, parseISO } from "date-fns";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import type { TRapporteringsperiodeStatus } from "~/utils/types";

interface IProps {
  innsendtTidspunkt: string;
  tilOgMed: string;
  status: TRapporteringsperiodeStatus;
}

export const SISTE_FRIST = 7; // TODO: Endre til hvor mange dager det skal være for sent

export function Innsendt({ innsendtTidspunkt, tilOgMed, status }: IProps) {
  const tilUtfylling = status === RAPPORTERINGSPERIODE_STATUS.Klar;
  if (tilUtfylling) return null;

  const dagerForskjell = differenceInDays(parseISO(innsendtTidspunkt), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  return forSent ? (
    <Tag variant="error" size="small">
      {formatterDato({ dato: innsendtTidspunkt })}
    </Tag>
  ) : (
    formatterDato({ dato: innsendtTidspunkt })
  );
}
