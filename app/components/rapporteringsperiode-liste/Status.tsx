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
    case RAPPORTERINGSPERIODE_STATUS.Opprettet:
      return "info";
    case RAPPORTERINGSPERIODE_STATUS.Klar:
      return "info";
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "success";
    case RAPPORTERINGSPERIODE_STATUS.Korrigert:
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
    case RAPPORTERINGSPERIODE_STATUS.Opprettet:
      return "Meldekort opprettet";
    case RAPPORTERINGSPERIODE_STATUS.Klar:
      return "Klar til utfylling";
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "Innsendt";
    case RAPPORTERINGSPERIODE_STATUS.Korrigert:
      return "Korrigert";
    case RAPPORTERINGSPERIODE_STATUS.Ferdig:
      return "Beregning utført";
    case RAPPORTERINGSPERIODE_STATUS.Feilet:
      return "Feilet";
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
