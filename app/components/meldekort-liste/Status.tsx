import React from "react";
import { Tag } from "@navikt/ds-react";
import { ERapporteringsperiodeStatus } from "../../utils/types";

interface StatusProps {
  status: ERapporteringsperiodeStatus;
}

const getStatus = (
  status: ERapporteringsperiodeStatus
): "info" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case ERapporteringsperiodeStatus.MeldekortOpprettet:
      return "warning";
    case ERapporteringsperiodeStatus.SkalIkkeBeregnes:
      return "info";
    case ERapporteringsperiodeStatus.BeregningUtført:
      return "success";
    case ERapporteringsperiodeStatus.FeilVedBeregning:
      return "error";
    default:
      return "neutral";
  }
};

export const Status: React.FC<StatusProps> = ({ status }) => {
  return <Tag variant={getStatus(status)}>{status}</Tag>;
};
