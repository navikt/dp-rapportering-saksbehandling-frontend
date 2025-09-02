import { Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode, TRapporteringsperiodeStatus } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
}

const getVariant = (status: TRapporteringsperiodeStatus): "info" | "success" => {
  switch (status) {
    case RAPPORTERINGSPERIODE_STATUS.Innsendt:
      return "success";
    default:
      return "info";
  }
};

export const PERIODE_RAD_STATUS = {
  Innsendt: RAPPORTERINGSPERIODE_STATUS.Innsendt,
  TilUtfylling: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
  Opprettet: "Opprettet",
  Korrigert: "Korrigert",
} as const;

export const getStatus = (
  periode: IRapporteringsperiode,
): "Innsendt" | "TilUtfylling" | "Opprettet" => {
  if (periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt) {
    return PERIODE_RAD_STATUS.Innsendt;
  }

  if (periode.kanSendes) {
    return PERIODE_RAD_STATUS.TilUtfylling;
  }

  return PERIODE_RAD_STATUS.Opprettet;
};

const getStatusText = (periode: IRapporteringsperiode): string => {
  const status = getStatus(periode);
  if (status === PERIODE_RAD_STATUS.Innsendt) {
    return "Innsendt";
  }

  if (status === PERIODE_RAD_STATUS.TilUtfylling) {
    return "Klar til utfylling";
  }

  return "Meldekort opprettet";
};

export function Status({ periode }: IProps) {
  const erKorrigert = !!periode.originalMeldekortId;

  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      <Tag variant={getVariant(periode.status)} size="small">
        {getStatusText(periode)}
      </Tag>
      {erKorrigert && (
        <Tag variant="warning" size="small">
          Korrigert
        </Tag>
      )}
    </div>
  );
}
