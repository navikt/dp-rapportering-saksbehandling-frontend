import { Table } from "@navikt/ds-react";

import type { ABTestVariant } from "~/utils/ab-test.utils";
import { getTogglePlacement } from "~/utils/ab-test.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { MeldekortRad } from "./components/rad/MeldekortRad";
import styles from "./meldekortListe.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  variant?: ABTestVariant;
}

export function MeldekortListe({ perioder, personId, ansvarligSystem, variant }: IProps) {
  // Bestem toggle placement basert på variant (bruker helper-funksjon)
  // null (ikke-demo miljø), Variant A: toggle left (original)
  // Variant B: toggle right
  const togglePlacement = getTogglePlacement(variant ?? null);

  // Original layout for null/A: toggle left with empty first column
  // New layout for variant B: toggle right with empty last column
  const KOLONNE_TITLER =
    togglePlacement === "right"
      ? ["Uke", "Dato", "Status", "Aktiviteter", "Meldedato", "Frist"]
      : ["", "Uke", "Dato", "Status", "Aktiviteter", "Meldedato", "Frist"];

  const KOLONNE_BREDDER =
    togglePlacement === "right"
      ? ["10%", "20%", "20%", "15%", "15%", "15%", "5%"]
      : ["5%", "10%", "20%", "18%", "18%", "14%", "15%"];

  return (
    <div className={styles.periodeListe}>
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
              />
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
