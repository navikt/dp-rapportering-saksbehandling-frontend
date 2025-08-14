import { Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode, TRapporteringsperiodeStatus } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
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

export function Status({ periode }: IProps) {
  const erKorrigert = periode.korrigering !== null;

  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      <Tag variant={getVariant(periode.status)} size="small">
        {getStatusText(periode.status)}
      </Tag>
      {erKorrigert && (
        <Tag variant="warning" size="small">
          Korrigert
        </Tag>
      )}
    </div>
  );
}
