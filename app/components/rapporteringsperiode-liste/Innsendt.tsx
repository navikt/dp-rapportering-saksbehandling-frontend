import { Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Innsendt({ periode }: IProps) {
  const { innsendtTidspunkt, status } = periode;

  const ikkeSendtInn = status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling;
  if (ikkeSendtInn || !innsendtTidspunkt) return null;

  const forSent = erMeldekortSendtForSent(periode);

  return forSent ? (
    <Tag variant="error" size="small">
      {formatterDato({ dato: innsendtTidspunkt })}
    </Tag>
  ) : (
    formatterDato({ dato: innsendtTidspunkt })
  );
}
