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

export function Status({ status }: IProps) {
  return <Tag variant={getVariant(status)}>{RAPPORTERINGSPERIODE_STATUS[status]}</Tag>;
}
