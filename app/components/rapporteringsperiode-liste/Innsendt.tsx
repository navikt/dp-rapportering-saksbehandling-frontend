import { Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Innsendt({ periode }: IProps) {
  const { innsendtTidspunkt, status, meldedato } = periode;

  const ikkeSendtInn = status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling;

  if (ikkeSendtInn || !innsendtTidspunkt || !meldedato) return null;

  const forSent = erMeldekortSendtForSent(periode);

  return forSent ? (
    <Tag variant="error" size="small">
      {formatterDato({ dato: meldedato })}
    </Tag>
  ) : (
    formatterDato({ dato: meldedato })
  );
}
