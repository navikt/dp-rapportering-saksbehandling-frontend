import { Accordion, Button, Table, Tag } from "@navikt/ds-react";
import { useEffect, useState } from "react";
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
  const tableInstructionsId = `table-instructions-${Math.random().toString(36).substring(2, 11)}`;

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

function getButtonText(
  valgteIds: string[],
  validCurrentUrlIds: string[],
  urlIsEmpty: boolean,
  hasChanges: boolean
) {
  if (valgteIds.length === 0 && validCurrentUrlIds.length > 0) {
    return "Fjern alle valgte perioder";
  }
  if (urlIsEmpty && valgteIds.length > 0) {
    return valgteIds.length === 1
      ? "Vis 1 valgt periode"
      : `Vis valgte perioder (${valgteIds.length})`;
  }
  if (hasChanges) {
    return valgteIds.length === 1
      ? "Oppdater 1 valgt periode"
      : `Oppdater valgte perioder (${valgteIds.length})`;
  }
  return valgteIds.length === 1
    ? "Viser 1 valgt periode"
    : `Viser ${valgteIds.length} valgte perioder`;
}

function getButtonAriaLabel(
  valgteIds: string[],
  validCurrentUrlIds: string[],
  urlIsEmpty: boolean,
  hasChanges: boolean
) {
  if (valgteIds.length === 0 && validCurrentUrlIds.length > 0) {
    return "Fjern alle valgte perioder fra visningen";
  }
  if (urlIsEmpty && valgteIds.length > 0) {
    return valgteIds.length === 1
      ? "Vis den valgte perioden"
      : `Vis de ${valgteIds.length} valgte periodene`;
  }
  if (hasChanges) {
    return valgteIds.length === 1
      ? "Oppdater visningen med den valgte perioden"
      : `Oppdater visningen med de ${valgteIds.length} valgte periodene`;
  }
  return valgteIds.length === 1
    ? "Visningsstatus: 1 periode vises for øyeblikket"
    : `Visningsstatus: ${valgteIds.length} perioder vises for øyeblikket`;
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
      return alleredeValgt ? prev.filter((v) => v !== id) : [...prev, id];
    });
  };

  const oppdaterValgteperioder = () => {
    const params = new URLSearchParams(searchParams);
    if (valgteIds.length === 0) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", valgteIds.join(","));
    }
    setSearchParams(params, { replace: true });
  };

  const fjernAlleValgteperioder = () => {
    setValgteIds([]);
    const params = new URLSearchParams(searchParams);
    params.delete("rapporteringsid");
    setSearchParams(params, { replace: true });
  };

  // Fjernet automatisk URL-opprydding - brudd på WCAG 3.2.2

  // Check if current URL selection differs from local state
  const currentUrlIds = searchParams.get("rapporteringsid")?.split(",") ?? [];
  // Filter out URL IDs that don't exist for this person
  const validCurrentUrlIds = currentUrlIds.filter((id) => gyldigeIds.has(id));

  // Special case: if URL is completely empty, always show "Vis" text (not "Oppdater")
  const urlIsEmpty = !searchParams.has("rapporteringsid") || currentUrlIds.every((id) => id === "");
  const hasChanges = urlIsEmpty
    ? false // Force "Vis" when URL is empty
    : JSON.stringify([...valgteIds].sort()) !== JSON.stringify([...validCurrentUrlIds].sort());

  // Button should be primary when there's an action to perform
  const isActionButton =
    hasChanges ||
    (urlIsEmpty && valgteIds.length > 0) ||
    (valgteIds.length === 0 && validCurrentUrlIds.length > 0);

  return (
    <div role="region" aria-labelledby="periode-heading">
      <h2 id="periode-heading" className="sr-only">
        Rapporteringsperioder gruppert etter år
      </h2>
      <Accordion size="small" headingSize="xsmall">
        {years.map((year) => (
          <Accordion.Item key={year} defaultOpen={year === years[0]}>
            <Accordion.Header>
              Meldekort for: {year} ({groupedPeriods[year].length} perioder)
            </Accordion.Header>
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

      {/* Oppdater valgte perioder knapp - vises alltid når det er endringer */}
      {(valgteIds.length > 0 || validCurrentUrlIds.length > 0) && (
        <div className={styles.yearGrouped__actions}>
          <div className={styles.yearGrouped__statusInfo}>
            <Tag
              variant="info"
              size="small"
              aria-live="polite"
              aria-describedby="total-selected-count"
            >
              {validCurrentUrlIds.length === 0
                ? "Ingen perioder vises"
                : validCurrentUrlIds.length === 1
                ? "1 periode vises"
                : `${validCurrentUrlIds.length} perioder vises`}
            </Tag>
          </div>
          <div className={styles.yearGrouped__buttonGroup}>
            {isActionButton && (
              <Button
                variant="primary"
                size="small"
                onClick={oppdaterValgteperioder}
                aria-describedby="total-selected-count"
                className={hasChanges ? styles.changeIndicator : ""}
                aria-label={getButtonAriaLabel(
                  valgteIds,
                  validCurrentUrlIds,
                  urlIsEmpty,
                  hasChanges
                )}
              >
                {getButtonText(valgteIds, validCurrentUrlIds, urlIsEmpty, hasChanges)}
              </Button>
            )}

            {/* Fjern alle knapp - vises når det er noe å fjerne */}
            {(valgteIds.length > 0 || validCurrentUrlIds.length > 0) && (
              <Button
                variant="tertiary"
                size="small"
                onClick={fjernAlleValgteperioder}
                aria-label="Fjern alle valgte perioder og tøm visningen"
                disabled={false}
              >
                Fjern alle
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Skjermleservennlig statusmelding - mindre støy */}
      <div role="status" aria-live="polite" className="sr-only">
        {valgteIds.length >= MAKS_VALGTE_PERIODER && (
          <span id="max-selected-message-year">
            Maksimalt antall perioder valgt. Du kan ikke velge flere.
          </span>
        )}
      </div>

      {/* Status for valg-teller - bare når det trengs */}
      {valgteIds.length > 0 && (
        <div className="sr-only">
          <span id="total-selected-count">
            {valgteIds.length} av {MAKS_VALGTE_PERIODER} rapporteringsperioder valgt totalt.
          </span>
        </div>
      )}
    </div>
  );
}
