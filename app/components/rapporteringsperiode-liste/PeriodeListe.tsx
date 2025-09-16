import { Accordion, Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeListe.module.css";
import { PeriodeRad } from "./PeriodeRad";
import { groupPeriodsByYear } from "./utils";

interface IProps {
  perioder: IRapporteringsperiode[];
  alternativVisning: boolean;
  personId?: string;
}

interface IPropsWithSharedState extends IProps {
  valgteIds: string[];
  onTogglePeriode: (id: string) => void;
  maksValgte: number;
}

const MAKS_VALGTE_PERIODER = 3;

const KOLONNE_TITLER = [
  { tekst: "Vis", erFørste: true, width: "5%" },
  { tekst: "Uke", erFørste: false, width: "5%" },
  { tekst: "Dato", erFørste: false, width: "10%" },
  { tekst: "Status", erFørste: false, width: "10%" },
  { tekst: "Aktiviteter", erFørste: false, width: "10%" },
  { tekst: "Meldedato", erFørste: false, width: "10%" },
  { tekst: "Frist", erFørste: false, width: "10%" },
] as const;

const ALTERNATIV_KOLONNE_TITLER = [
  { tekst: "", erFørste: true, width: "5%" },
  { tekst: "Uke", erFørste: false, width: "10%" },
  { tekst: "Dato", erFørste: false, width: "20%" },
  { tekst: "Status", erFørste: false, width: "15%" },
  { tekst: "Aktiviteter", erFørste: false, width: "20%" },
  { tekst: "Meldedato", erFørste: false, width: "15%" },
  { tekst: "Frist", erFørste: false, width: "15%" },
] as const;

// Intern komponent uten egen state for bruk i accordion
function RapporteringsperiodeTabell({
  perioder,
  valgteIds,
  onTogglePeriode,
  maksValgte,
  alternativVisning,
  personId,
}: IPropsWithSharedState) {
  const titler = alternativVisning ? ALTERNATIV_KOLONNE_TITLER : KOLONNE_TITLER;
  return (
    <div className={styles.periodeListe} style={alternativVisning ? { width: "100%" } : undefined}>
      <Table style={alternativVisning ? { width: "100%", tableLayout: "fixed" } : undefined}>
        <Table.Header>
          <Table.Row>
            {titler.map((kolonne, index) => {
              const className = kolonne.erFørste
                ? `${styles.periodeListe__header} ${styles["periodeListe__header--first"]}`
                : styles.periodeListe__header;

              return (
                <Table.HeaderCell
                  key={index}
                  scope="col"
                  className={className}
                  textSize="small"
                  style={{ width: kolonne.width }}
                >
                  {kolonne.tekst}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            const erValgt = valgteIds.includes(periode.id);
            if (alternativVisning) {
              return (
                <PeriodeRad
                  key={periode.id}
                  periode={periode}
                  valgt={erValgt}
                  toggle={onTogglePeriode}
                  valgteAntall={valgteIds.length}
                  maksValgte={maksValgte}
                  alternativVisning={alternativVisning}
                  personId={personId}
                />
              );
            }
            return (
              <PeriodeRad
                key={periode.id}
                periode={periode}
                valgt={erValgt}
                toggle={onTogglePeriode}
                valgteAntall={valgteIds.length}
                maksValgte={maksValgte}
                alternativVisning={alternativVisning}
                personId={personId}
              />
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}

/**
 * Main component that groups reporting periods by year in an accordion
 */
export function RapporteringsperiodeListeByYear({
  perioder,
  alternativVisning = false,
  personId,
}: IProps) {
  const gyldigeIds = new Set(perioder.map((p) => p.id));
  const groupedPeriods = groupPeriodsByYear(perioder);
  const years = Object.keys(groupedPeriods)
    .map(Number)
    .sort((a, b) => b - a); // Nyeste år først

  const [searchParams, setSearchParams] = useSearchParams();
  const [valgteAar, setValgteAar] = useState<number[]>(
    searchParams
      .get("aar")
      ?.split(",")
      .map(Number)
      .filter((aar) => years.includes(aar)) ?? [years[0]],
  );
  const [valgteIds, setValgteIds] = useState<string[]>(
    searchParams
      .get("rapporteringsid")
      ?.split(",")
      .filter((id) => gyldigeIds.has(id)) ?? [],
  );

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (valgteIds.length > 0) {
      newParams.set("rapporteringsid", valgteIds.join(","));
    } else {
      newParams.delete("rapporteringsid");
    }
    setSearchParams(newParams, { replace: true, preventScrollReset: true });
  }, [valgteIds]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (valgteAar.length > 0) {
      newParams.set("aar", valgteAar.join(","));
    } else {
      newParams.delete("aar");
    }
    setSearchParams(newParams, { replace: true, preventScrollReset: true });
  }, [valgteAar]);

  const togglePeriode = (id: string) => {
    setValgteIds((prev) => {
      const alleredeValgt = prev.includes(id);
      if (!alleredeValgt && prev.length >= MAKS_VALGTE_PERIODER) return prev;
      return alleredeValgt ? prev.filter((v) => v !== id) : [...prev, id];
    });
  };

  function toggleAr(year: number) {
    setValgteAar((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  }

  return (
    <section>
      <Accordion size="small">
        {years.map((year) => (
          <Accordion.Item
            key={year}
            defaultOpen={year === years[0]}
            open={valgteAar.includes(year)}
          >
            <Accordion.Header className={styles.accordionHeader} onClick={() => toggleAr(year)}>
              Meldekort for {year}
            </Accordion.Header>
            <Accordion.Content style={{ padding: 0 }}>
              <RapporteringsperiodeTabell
                perioder={groupedPeriods[year]}
                valgteIds={valgteIds}
                onTogglePeriode={togglePeriode}
                maksValgte={MAKS_VALGTE_PERIODER}
                alternativVisning={alternativVisning}
                personId={personId}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
      {/* Skjermleservennlig statusmelding */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {valgteIds.length > 0 && (
          <span>
            {valgteIds.length >= MAKS_VALGTE_PERIODER &&
              "Maksimalt antall perioder valgt. Du kan ikke velge flere."}
          </span>
        )}
      </div>
    </section>
  );
}
