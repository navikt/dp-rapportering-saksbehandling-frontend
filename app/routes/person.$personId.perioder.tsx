import { Accordion } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useRouteLoaderData, useSearchParams } from "react-router";

import { MeldekortListe } from "~/components/meldekort-liste/MeldekortListe";
import { groupPeriodsByYear } from "~/components/meldekort-liste/utils";
import type { loader as personLoader } from "~/routes/person.$personId";
import styles from "~/styles/route-styles/perioder.module.css";
import { getABTestVariant } from "~/utils/ab-test.server";
import { QUERY_PARAMS } from "~/utils/constants";
import { DEFAULT_PERSON } from "~/utils/constants";
import { sortYearsDescending, ukenummer } from "~/utils/dato.utils";

import type { Route } from "./+types/person.$personId.perioder";

export async function loader({ request }: Route.LoaderArgs) {
  const variant = getABTestVariant(request);

  return { variant };
}

export default function Rapportering({ params, loaderData }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof personLoader>("routes/person.$personId");
  const perioder = data?.perioder ?? [];
  const person = data?.person ?? DEFAULT_PERSON;
  const { variant } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [announceUpdate, setAnnounceUpdate] = useState("");

  // Håndter announcement for skjermlesere når en periode er oppdatert
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

  const groupedPeriods = groupPeriodsByYear(perioder);
  const years = sortYearsDescending(groupedPeriods);

  const [valgteAar, setValgteAar] = useState<number[]>(() => {
    const aarParam = searchParams.get(QUERY_PARAMS.AAR);
    if (aarParam) {
      return aarParam
        .split(",")
        .map(Number)
        .filter((aar) => years.includes(aar));
    }
    return years.length > 0 ? [years[0]] : [];
  });

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (valgteAar.length > 0) {
      newParams.set(QUERY_PARAMS.AAR, valgteAar.join(","));
    } else {
      newParams.delete(QUERY_PARAMS.AAR);
    }
    setSearchParams(newParams, { replace: true, preventScrollReset: true });
  }, [valgteAar, searchParams, setSearchParams]);

  const toggleAr = (year: number) => {
    setValgteAar((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  return (
    <div className={styles.perioderContainer}>
      <section>
        {/* Screen reader announcement for oppdaterte meldekort */}
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
              <Accordion.Header onClick={() => toggleAr(year)}>
                Meldekort for {year}
              </Accordion.Header>
              <Accordion.Content className={styles.accordionContent}>
                <MeldekortListe
                  perioder={groupedPeriods[year]}
                  personId={params.personId}
                  ansvarligSystem={person.ansvarligSystem}
                  variant={variant}
                />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
