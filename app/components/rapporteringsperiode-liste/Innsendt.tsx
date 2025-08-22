import { Tag } from "@navikt/ds-react";
import { parseISO } from "date-fns";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Innsendt({ periode }: IProps) {
  const { innsendtTidspunkt, status, sisteFristForTrekk } = periode;

  if (status === RAPPORTERINGSPERIODE_STATUS.Klar || !innsendtTidspunkt) return null;

  // Sjekk om det er en korrigering eller utfylling av saksbehandler
  const erKorrigering = periode.korrigering !== null;
  const erUtfyltAvSaksbehandler = periode.kilde?.rolle === "Saksbehandler";

  // Ikke vis "for sent" for korreksjon eller saksbehandler-utfylling
  const skalIgnorereFrist = erKorrigering || erUtfyltAvSaksbehandler;

  // Bruk sisteFristForTrekk hvis tilgjengelig, ellers sammenlign med periode slutt
  const forSent =
    !skalIgnorereFrist && sisteFristForTrekk
      ? parseISO(innsendtTidspunkt) > parseISO(sisteFristForTrekk)
      : false;

  return forSent ? (
    <Tag variant="error" size="small">
      {formatterDato({ dato: innsendtTidspunkt })}
    </Tag>
  ) : (
    formatterDato({ dato: innsendtTidspunkt })
  );
}
