import { Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { TRapporteringsperiodeStatus } from "~/utils/types";

interface IProps {
  status: TRapporteringsperiodeStatus;
}

const getVariant = (
  status: TRapporteringsperiodeStatus,
): "info" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case RAPPORTERINGSPERIODE_STATUS.Opprettet:
      return "info";
    case RAPPORTERINGSPERIODE_STATUS.Klar:
      return "info";
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "success";
    default:
      return "neutral";
  }
};

const getStatusText = (status: TRapporteringsperiodeStatus): string => {
  switch (status) {
    case RAPPORTERINGSPERIODE_STATUS.Opprettet:
      return "Meldekort opprettet";
    case RAPPORTERINGSPERIODE_STATUS.Klar:
      return "Klar til utfylling";
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "Innsendt";
    default:
      return "Ukjent status";
  }
};

export function Status({ status }: IProps) {
  return (
    <Tag variant={getVariant(status)} size="small">
      {getStatusText(status)}
    </Tag>
  );
}
