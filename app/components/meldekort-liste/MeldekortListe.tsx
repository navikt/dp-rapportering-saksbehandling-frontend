import { Table } from "@navikt/ds-react";

import type { IMeldekortHovedside } from "~/sanity/sider/hovedside/types";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { getTogglePlacement } from "~/utils/ab-test.utils";
import type { IBehandlingerPerPeriode } from "~/utils/behandlingsresultat.types";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { MeldekortRad } from "./components/rad/MeldekortRad";
import styles from "./meldekortListe.module.css";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_KOLONNER = {
  uke: "Uke",
  dato: "Dato",
  status: "Status",
  aktiviteter: "Aktiviteter",
  meldedato: "Meldedato",
  frist: "Frist",
};

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  variant?: ABTestVariant;
  behandlinger?: IBehandlingerPerPeriode;
  hovedsideData?: IMeldekortHovedside | null;
}

export function MeldekortListe({
  perioder,
  personId,
  ansvarligSystem,
  variant,
  behandlinger,
  hovedsideData,
}: IProps) {
  // Bestem toggle placement basert på variant (bruker helper-funksjon)
  // null (ikke-demo miljø), Variant A og Variant C: toggle left (original)
  // Variant B: toggle right
  const togglePlacement = getTogglePlacement(variant ?? null);

  // Kombiner defaults med Sanity-data - Sanity overstyrer, defaults fyller inn hull
  const kolonner = { ...DEFAULT_KOLONNER, ...(hovedsideData?.tabellKolonner ?? {}) };

  // Original layout for null/A/C: toggle left with empty first column
  // New layout for variant B: toggle right with empty last column
  const basisKolonner = [
    kolonner.uke,
    kolonner.dato,
    kolonner.status,
    kolonner.aktiviteter,
    kolonner.meldedato,
    kolonner.frist,
  ];

  const KOLONNE_TITLER = togglePlacement === "right" ? basisKolonner : ["", ...basisKolonner];

  const KOLONNE_BREDDER =
    togglePlacement === "right"
      ? ["10%", "20%", "20%", "15%", "15%", "15%", "5%"]
      : ["5%", "10%", "20%", "18%", "18%", "14%", "15%"];

  return (
    <div className={`${styles.periodeListe} ${variant === "B" ? styles.variantB : ""}`}>
      <Table>
        <colgroup>
          {KOLONNE_BREDDER.map((bredde, index) => (
            <col key={index} style={{ width: bredde }} />
          ))}
        </colgroup>
        <Table.Header>
          <Table.Row>
            {KOLONNE_TITLER.map((kolonne, index) => {
              return (
                <Table.HeaderCell key={index} scope="col" textSize="small">
                  {kolonne}
                </Table.HeaderCell>
              );
            })}
            {togglePlacement === "right" && (
              <Table.HeaderCell scope="col" textSize="small">
                {/* Tom header for toggle-kolonne */}
              </Table.HeaderCell>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            return (
              <MeldekortRad
                key={periode.id}
                periode={periode}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
                togglePlacement={togglePlacement}
                variant={variant}
                allePerioder={perioder}
                behandlinger={behandlinger ? behandlinger[periode.id] : undefined}
                hovedsideData={hovedsideData}
              />
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
