import { Tag } from "@navikt/ds-react";
import { parseISO } from "date-fns";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Innsendt({ periode }: IProps) {
  const { meldedato, status, sisteFristForTrekk } = periode;

  if (status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling || !meldedato) return null;

  // Sjekk om det er en korrigering eller utfylling av saksbehandler
  const erKorrigering = !!periode.originalMeldekortId;
  const erUtfyltAvSaksbehandler = periode.kilde?.rolle === "Saksbehandler";

  // Ikke vis "for sent" for korreksjon eller saksbehandler-utfylling
  const skalIgnorereFrist = erKorrigering || erUtfyltAvSaksbehandler;

  // Bruk sisteFristForTrekk hvis tilgjengelig, ellers sammenlign med periode slutt
  const forSent =
    !skalIgnorereFrist && sisteFristForTrekk
      ? parseISO(meldedato) > parseISO(sisteFristForTrekk)
      : false;

  return forSent ? (
    <Tag variant="error" size="small">
      {formatterDato({ dato: meldedato })}
    </Tag>
  ) : (
    formatterDato({ dato: meldedato })
  );
}
