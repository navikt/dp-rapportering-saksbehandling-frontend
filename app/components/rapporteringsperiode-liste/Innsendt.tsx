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
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;

  if (status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling) {
    return (
      <div className="transparrent-tag">
        <Tag variant="neutral"> </Tag>
      </div>
    );
  }

  if (forSent) {
    return (
      <Tag role="alert" variant="error">
        {formatterDato({ dato: mottattDato })}
      </Tag>
    );
  }

  return (
    <div className="transparrent-tag">
      <Tag variant="neutral">{formatterDato({ dato: mottattDato })}</Tag>
    </div>
  );
}
