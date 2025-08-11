import { Accordion, Button, Table } from "@navikt/ds-react";
import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router";

import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeListe.module.css";
import { PeriodeRad } from "./PeriodeRad";
import { groupPeriodsByYear } from "./utils";

interface Props {
  perioder: IRapporteringsperiode[];
}

interface PropsWithSharedState extends Props {
  valgteIds: string[];
  onTogglePeriode: (id: string) => void;
  maksValgte: number;
}

const MAKS_VALGTE_PERIODER = 3;

const KOLONNE_TITLER = [
  { tekst: "Vis", erFørste: true },
  { tekst: "Uke", erFørste: false },
  { tekst: "Dato", erFørste: false },
  { tekst: "Status", erFørste: false },
  { tekst: "Aktiviteter", erFørste: false },
  { tekst: "Innsendt", erFørste: false },
  { tekst: "Frist", erFørste: false },
] as const;

// Intern komponent uten egen state for bruk i accordion
function RapporteringsperiodeTabell({
  perioder,
  valgteIds,
  onTogglePeriode,
  maksValgte,
}: PropsWithSharedState) {
  const tableInstructionsId = useId();

  return (
    <div className={styles.periodeListe}>
      <div id={tableInstructionsId} className="sr-only">
        Du kan velge maksimalt {maksValgte} perioder for sammenligning. Bruk mellomrom eller enter
        for å velge/avvelge en periode.
      </div>
      <Table aria-describedby={tableInstructionsId}>
        <Table.Header>
          <Table.Row>
            {KOLONNE_TITLER.map((kolonne, index) => {
              const className = kolonne.erFørste
                ? `${styles.periodeListe__header} ${styles["periodeListe__header--first"]}`
                : styles.periodeListe__header;

              return (
                <Table.HeaderCell key={index} scope="col" className={className} textSize="small">
                  {kolonne.tekst}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            const erValgt = valgteIds.includes(periode.id);

            return (
              <PeriodeRad
                key={periode.id}
                periode={periode}
                valgt={erValgt}
                toggle={onTogglePeriode}
                valgteAntall={valgteIds.length}
                maksValgte={maksValgte}
              />
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}

export function RapporteringsperiodeListe({ perioder }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [valgteIds, setValgteIds] = useState<string[]>([]);

  const gyldigeIds = new Set(perioder.map((p) => p.id));
  const tableInstructionsId = `table-instructions-${Math.random().toString(36).substring(2, 11)}`;

  // Les én gang ved mount eller når searchParams endrer seg
  useEffect(() => {
    const raw = searchParams.get("rapporteringsid")?.split(",") ?? [];
    const filtrerte = raw.filter((id) => gyldigeIds.has(id));
    setValgteIds(filtrerte);
  }, [searchParams, perioder]);

  // Fjernet automatisk URL-oppdatering - brukeren må trykke knapp

  const togglePeriode = (id: string) => {
    setValgteIds((prev) => {
      const alleredeValgt = prev.includes(id);
      if (!alleredeValgt && prev.length >= MAKS_VALGTE_PERIODER) return prev;
      return alleredeValgt ? prev.filter((v) => v !== id) : [...prev, id];
    });
  };

  const visValgteperioder = () => {
    const params = new URLSearchParams(searchParams);
    if (valgteIds.length === 0) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", valgteIds.join(","));
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className={styles.periodeListe}>
      <div id={tableInstructionsId} className="sr-only">
        Du kan velge maksimalt {MAKS_VALGTE_PERIODER} perioder for sammenligning. Bruk mellomrom
        eller enter for å velge/avvelge en periode.
      </div>
      <Table aria-describedby={tableInstructionsId}>
        <Table.Header>
          <Table.Row>
            {KOLONNE_TITLER.map((kolonne, index) => {
              const className = kolonne.erFørste
                ? `${styles.periodeListe__header} ${styles["periodeListe__header--first"]}`
                : styles.periodeListe__header;

              return (
                <Table.HeaderCell key={index} scope="col" className={className} textSize="small">
                  {kolonne.tekst}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => (
            <PeriodeRad
              key={periode.id}
              periode={periode}
              valgt={valgteIds.includes(periode.id)}
              toggle={togglePeriode}
              valgteAntall={valgteIds.length}
              maksValgte={MAKS_VALGTE_PERIODER}
            />
          ))}
        </Table.Body>
      </Table>

      {/* Vis valgte perioder knapp */}
      {valgteIds.length > 0 && (
        <div className={styles.periodeListe__actions}>
          <Button
            variant="primary"
            size="small"
            onClick={visValgteperioder}
            aria-describedby="selected-count"
          >
            Vis valgte perioder ({valgteIds.length})
          </Button>
        </div>
      )}

      {/* Skjermleservennlig statusmelding */}
      <div role="status" aria-live="polite" className="sr-only">
        {valgteIds.length > 0 && (
          <span id="selected-count">
            {valgteIds.length} av {MAKS_VALGTE_PERIODER} rapporteringsperioder valgt.
          </span>
        )}
        {valgteIds.length >= MAKS_VALGTE_PERIODER && (
          <span id="max-selected-message">
            Maksimalt antall perioder valgt. Du kan ikke velge flere.
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Main component that groups reporting periods by year in an accordion
 */
export function RapporteringsperiodeListeByYear({ perioder }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [valgteIds, setValgteIds] = useState<string[]>([]);

  const groupedPeriods = groupPeriodsByYear(perioder);
  const years = Object.keys(groupedPeriods)
    .map(Number)
    .sort((a, b) => b - a); // Nyeste år først

  const gyldigeIds = new Set(perioder.map((p) => p.id));

  // Les fra URL ved mount
  useEffect(() => {
    const raw = searchParams.get("rapporteringsid")?.split(",") ?? [];
    const filtrerte = raw.filter((id) => gyldigeIds.has(id));
    setValgteIds(filtrerte);
  }, [searchParams, perioder]);

  const togglePeriode = (id: string) => {
    setValgteIds((prev) => {
      const alleredeValgt = prev.includes(id);
      if (!alleredeValgt && prev.length >= MAKS_VALGTE_PERIODER) return prev;
      const nyeIds = alleredeValgt ? prev.filter((v) => v !== id) : [...prev, id];

      // Oppdater URL automatisk når IDs endres
      const newParams = new URLSearchParams(searchParams);
      if (nyeIds.length > 0) {
        newParams.set("rapporteringsid", nyeIds.join(","));
      } else {
        newParams.delete("rapporteringsid");
      }
      setSearchParams(newParams, { replace: true });

      return nyeIds;
    });
  };

  return (
    <div role="region" aria-labelledby="periode-heading">
      <h2 id="periode-heading" className="sr-only">
        Rapporteringsperioder gruppert etter år
      </h2>
      <Accordion size="small" headingSize="xsmall">
        {years.map((year) => (
          <Accordion.Item key={year} defaultOpen={year === years[0]}>
            <Accordion.Header>Meldekort for {year}</Accordion.Header>
            <Accordion.Content style={{ padding: 0 }}>
              <RapporteringsperiodeTabell
                perioder={groupedPeriods[year]}
                valgteIds={valgteIds}
                onTogglePeriode={togglePeriode}
                maksValgte={MAKS_VALGTE_PERIODER}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
      {/* Skjermleservennlig statusmelding - mindre støy */}
      <div role="status" aria-live="polite" className="sr-only">
        {valgteIds.length >= MAKS_VALGTE_PERIODER && (
          <span id="max-selected-message-year">
            Maksimalt antall perioder valgt. Du kan ikke velge flere.
          </span>
        )}
      </div>
    </div>
  );
}
