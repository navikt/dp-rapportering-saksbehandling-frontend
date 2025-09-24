import { Accordion, Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { QUERY_PARAMS } from "~/utils/constants";
import { ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import styles from "./PeriodeListe.module.css";
import { PeriodeRad } from "./PeriodeRad";
import { groupPeriodsByYear } from "./utils";

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

interface IPropsWithSharedState extends IProps {
  valgteIds: string[];
}

const ALTERNATIV_KOLONNE_TITLER = [
  { tekst: "", erFørste: true },
  { tekst: "Uke", erFørste: false },
  { tekst: "Dato", erFørste: false },
  { tekst: "Status", erFørste: false },
  { tekst: "Aktiviteter", erFørste: false },
  { tekst: "Meldedato", erFørste: false },
  { tekst: "Frist", erFørste: false },
] as const;

// Intern komponent uten egen state for bruk i accordion
function RapporteringsperiodeTabell({
  perioder,
  personId,
  ansvarligSystem,
}: IPropsWithSharedState) {
  const titler = ALTERNATIV_KOLONNE_TITLER;
  return (
    <div className={styles.periodeListe}>
      <Table size="small">
        <Table.Header>
          <Table.Row>
            {titler.map((kolonne, index) => {
              return (
                <Table.HeaderCell key={index} scope="col" textSize="small">
                  {kolonne.tekst}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            return (
              <PeriodeRad
                key={periode.id}
                periode={periode}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
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
export function RapporteringsperiodeListeByYear({ perioder, personId, ansvarligSystem }: IProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [announceUpdate, setAnnounceUpdate] = useState("");

  // Håndter announcement for skjermlesere når er periode er oppdatert
  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);
    if (oppdatertId) {
      const periode = perioder.find((p) => p.id === oppdatertId);

      if (periode) {
        const erKorrigering = periode.originalMeldekortId;
        const melding = erKorrigering
          ? `Meldekort for uke ${ukenummer(periode)} ble korrigert og oppdatert`
          : `Meldekort for uke ${ukenummer(periode)} ble sendt inn`;
        setAnnounceUpdate(melding);

        // fjern parametere etter melding er satt
        setTimeout(() => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete(QUERY_PARAMS.OPPDATERT);
          setSearchParams(newSearchParams, { replace: true });
        }, 0);
        // fjern melding etter 5 sekunder
        setTimeout(() => {
          setAnnounceUpdate("");
        }, 5000);
      }
    }
  }, [searchParams, setSearchParams, perioder]);

  const gyldigeIds = new Set(perioder.map((p) => p.id));
  const groupedPeriods = groupPeriodsByYear(perioder);
  const years = Object.keys(groupedPeriods)
    .map(Number)
    .sort((a, b) => b - a); // Nyeste år først

  const [valgteAar, setValgteAar] = useState<number[]>(
    searchParams
      .get("aar")
      ?.split(",")
      .map(Number)
      .filter((aar) => years.includes(aar)) ?? [years[0]],
  );
  const [valgteIds] = useState<string[]>(
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

  function toggleAr(year: number) {
    setValgteAar((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  }

  return (
    <section>
      {/* Screen reader announcement for updated periods */}
      {announceUpdate && (
        <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
          {announceUpdate}
        </div>
      )}
      <Accordion size="small">
        {years.map((year) => (
          <Accordion.Item
            key={year}
            defaultOpen={year === years[0]}
            open={valgteAar.includes(year)}
          >
            <Accordion.Header onClick={() => toggleAr(year)}>Meldekort for {year}</Accordion.Header>
            <Accordion.Content style={{ padding: 0 }}>
              <RapporteringsperiodeTabell
                perioder={groupedPeriods[year]}
                valgteIds={valgteIds}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}
