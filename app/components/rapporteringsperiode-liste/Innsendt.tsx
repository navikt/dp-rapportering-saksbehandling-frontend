import { Tag } from "@navikt/ds-react";
import { differenceInDays, parseISO } from "date-fns";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import type { TRapporteringsperiodeStatus } from "~/utils/types";

interface IProps {
  mottattDato: string;
  tilOgMed: string;
  status: TRapporteringsperiodeStatus;
}

export const SISTE_FRIST = 7; // TODO: Endre til hvor mange dager det skal være for sent

export function Innsendt({ mottattDato, tilOgMed, status }: IProps) {
  const tilUtfylling = status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling;
  if (tilUtfylling) return null;

  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  return forSent ? (
    <Tag variant="error" size="small">
      {formatterDato({ dato: mottattDato })}
    </Tag>
  ) : (
    formatterDato({ dato: mottattDato })
  );
}
