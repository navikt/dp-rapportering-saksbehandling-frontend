import { Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { TRapporteringsperiodeStatus } from "~/utils/types";

interface IProps {
  status: TRapporteringsperiodeStatus;
}

const getVariant = (
  status: TRapporteringsperiodeStatus
): "info" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case RAPPORTERINGSPERIODE_STATUS.TilUtfylling:
      return "info";
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "success";
    case RAPPORTERINGSPERIODE_STATUS.Endret:
      return "warning";
    case RAPPORTERINGSPERIODE_STATUS.Ferdig:
      return "success";
    case RAPPORTERINGSPERIODE_STATUS.Feilet:
      return "error";
    default:
      return "neutral";
  }
};

const getStatusText = (status: TRapporteringsperiodeStatus): string => {
  switch (status) {
    case RAPPORTERINGSPERIODE_STATUS.TilUtfylling:
      return "Opprettet";
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "Innsendt";
    case RAPPORTERINGSPERIODE_STATUS.Endret:
      return "Endret";
    case RAPPORTERINGSPERIODE_STATUS.Ferdig:
      return "Beregnet";
    case RAPPORTERINGSPERIODE_STATUS.Feilet:
      return "Feilet";
    default:
      return "Ukjent status";
  }
};

export function Status({ status }: IProps) {
  return <Tag variant={getVariant(status)}>{getStatusText(status)}</Tag>;
}
