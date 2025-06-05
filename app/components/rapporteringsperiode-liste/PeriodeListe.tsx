import { Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeListe.module.css";
import { PeriodeRad } from "./PeriodeRad";

interface Props {
  perioder: IRapporteringsperiode[];
}

const MAKS_VALGTE_PERIODER = 3;

function KolonneTittel({
  children,
  erFørste = false,
}: {
  children: React.ReactNode;
  erFørste?: boolean;
}) {
  const className = erFørste
    ? `${styles.periodeListe__header} ${styles["periodeListe__header--first"]}`
    : styles.periodeListe__header;

  return (
    <Table.HeaderCell scope="col" className={className} textSize="small">
      {children}
    </Table.HeaderCell>
  );
}

export function RapporteringsperiodeListe({ perioder }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [valgteIds, setValgteIds] = useState<string[]>([]);

  const gyldigeIds = new Set(perioder.map((p) => p.id));

  // Les én gang ved mount eller når searchParams endrer seg
  useEffect(() => {
    const raw = searchParams.get("rapporteringsid")?.split(",") ?? [];
    const filtrerte = raw.filter((id) => gyldigeIds.has(id));
    setValgteIds(filtrerte);
  }, [searchParams, perioder]);

  // Oppdater URL når valgteIds endres
  useEffect(() => {
    const prev = searchParams.get("rapporteringsid")?.split(",") ?? [];
    const erUlikt = prev.join(",") !== valgteIds.join(",");

    if (erUlikt) {
      const params = new URLSearchParams(searchParams);
      if (valgteIds.length === 0) {
        params.delete("rapporteringsid");
      } else {
        params.set("rapporteringsid", valgteIds.join(","));
      }
      setSearchParams(params, { replace: true });
    }
  }, [valgteIds]);

  const togglePeriode = (id: string) => {
    setValgteIds((prev) => {
      const alleredeValgt = prev.includes(id);
      if (!alleredeValgt && prev.length >= MAKS_VALGTE_PERIODER) return prev;
      return alleredeValgt ? prev.filter((v) => v !== id) : [...prev, id];
    });
  };

  return (
    <div className={styles.periodeListe}>
      <Table>
        <caption className="sr-only">Liste over rapporteringsperioder</caption>
        <Table.Header>
          <Table.Row>
            <KolonneTittel erFørste>Vis</KolonneTittel>
            <KolonneTittel>Uke</KolonneTittel>
            <KolonneTittel>Dato</KolonneTittel>
            <KolonneTittel>Status</KolonneTittel>
            <KolonneTittel>Aktiviteter</KolonneTittel>
            <KolonneTittel>Innsendt</KolonneTittel>
            <KolonneTittel>Frist</KolonneTittel>
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

      {/* Skjermleservennlig statusmelding ved maksvalg */}
      {valgteIds.length >= MAKS_VALGTE_PERIODER && (
        <div role="status" aria-live="polite" className="sr-only">
          Du kan ikke velge flere enn {MAKS_VALGTE_PERIODER} rapporteringsperioder.
        </div>
      )}
    </div>
  );
}
