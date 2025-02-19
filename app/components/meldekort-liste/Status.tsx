import { Tag } from "@navikt/ds-react";
import { ERapporteringsperiodeStatus } from "../../utils/types";

interface IProps {
  status: ERapporteringsperiodeStatus;
}

const getStatus = (
  status: ERapporteringsperiodeStatus
): "info" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case ERapporteringsperiodeStatus.TilUtfylling:
      return "info";
    case ERapporteringsperiodeStatus.Innsendt:
      return "success";
    case ERapporteringsperiodeStatus.Endret:
      return "warning";
    case ERapporteringsperiodeStatus.Ferdig:
      return "success";
    case ERapporteringsperiodeStatus.Feilet:
      return "error";
    default:
      return "neutral";
  }
};

export function Status({ status }: IProps) {
  return <Tag variant={getStatus(status)}>{status}</Tag>;
}
