import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { Accordion, Heading, InfoCard } from "@navikt/ds-react";
import { useEffect, useRef, useState } from "react";
import { useRouteLoaderData, useSearchParams } from "react-router";

import { MeldekortListe } from "~/components/meldekort-liste/MeldekortListe";
import { groupPeriodsByYear } from "~/components/meldekort-liste/utils";
import type { loader as personLoader } from "~/routes/person.$personId";
import { sanityTekst } from "~/sanity/utils";
import styles from "~/styles/route-styles/perioder.module.css";
import { getABTestVariant } from "~/utils/ab-test.server";
import { QUERY_PARAMS } from "~/utils/constants";
import { DEFAULT_PERSON } from "~/utils/constants";
import { sortYearsDescending, ukenummer } from "~/utils/dato.utils";
import { byggFulltNavn } from "~/utils/person.utils";

import type { Route } from "./+types/person.$personId.perioder";

export async function loader({ request }: Route.LoaderArgs) {
  const variant = getABTestVariant(request);

  return { variant };
}

export default function Rapportering({ params, loaderData }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof personLoader>("routes/person.$personId");
  const perioder = data?.perioder ?? [];
  const person = data?.person ?? DEFAULT_PERSON;
  const hovedsideData = data?.hovedsideData;
  const { variant } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [announceUpdate, setAnnounceUpdate] = useState("");

  const isMountedRef = useRef(true);

  // Cleanup ved unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Håndter announcement for skjermlesere når en periode er oppdatert
  useEffect(() => {
    const oppdaterteIder = searchParams.get(QUERY_PARAMS.OPPDATERT)?.split(",") ?? [];
    if (oppdaterteIder.length > 0) {
      const periode = perioder.find(
        (p) =>
          oppdaterteIder.includes(p.id) ||
          oppdaterteIder.includes(`${p.periode.fraOgMed}_${p.periode.tilOgMed}`),
      );

      if (periode) {
        const erKorrigering = periode.originalMeldekortId;
        const melding = erKorrigering
          ? `Meldekort for uke ${ukenummer(periode)} ble korrigert og oppdatert`
          : `Meldekort for uke ${ukenummer(periode)} ble sendt inn`;
        setAnnounceUpdate(melding);

        // fjern parametere etter melding er satt
        const paramTimeout = setTimeout(() => {
          if (isMountedRef.current) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(QUERY_PARAMS.OPPDATERT);
            setSearchParams(newSearchParams, { replace: true });
          }
        }, 100);

        // fjern melding etter 5 sekunder
        const messageTimeout = setTimeout(() => {
          if (isMountedRef.current) {
            setAnnounceUpdate("");
          }
        }, 8000);

        return () => {
          clearTimeout(paramTimeout);
          clearTimeout(messageTimeout);
        };
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

  const fulltNavn = byggFulltNavn(person.fornavn, person.mellomnavn, person.etternavn);

  const sidetittel = sanityTekst(hovedsideData?.overskrift, "hovedside.overskrift").replace(
    "{{navn}}",
    fulltNavn,
  );

  return (
    <div className={styles.perioderPageContainer}>
      <Heading level="1" size="large" spacing>
        {sidetittel}
      </Heading>
      <div
        className={`${styles.perioderContainer} ${perioder.length === 0 ? styles.tomTilstand : ""}`}
      >
        {/* Screen reader announcement for oppdaterte meldekort */}
        {announceUpdate && (
          <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
            {announceUpdate}
          </div>
        )}
        {perioder.length === 0 ? (
          <section aria-labelledby="ingen-meldekort-tittel">
            <InfoCard data-color="warning" size="small">
              <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                <InfoCard.Title id="ingen-meldekort-tittel">
                  Her har det skjedd en feil
                </InfoCard.Title>
              </InfoCard.Header>
              <InfoCard.Content>
                Her mangler det meldekort. Ta kontakt med brukerstøtte.
              </InfoCard.Content>
            </InfoCard>
          </section>
        ) : (
          <section aria-label="Meldekort gruppert etter år">
            <Accordion size="small" indent={false}>
              {years.map((year) => {
                const aarOverskrift = sanityTekst(
                  hovedsideData?.listeOverskrift,
                  "hovedside.listeOverskrift",
                ).replace("{{aar}}", String(year));
                return (
                  <Accordion.Item
                    key={year}
                    defaultOpen={year === years[0]}
                    open={valgteAar.includes(year)}
                  >
                    <Accordion.Header onClick={() => toggleAr(year)}>
                      {aarOverskrift}
                    </Accordion.Header>
                    <Accordion.Content className={styles.accordionContent}>
                      <MeldekortListe
                        perioder={groupedPeriods[year]}
                        personId={params.personId}
                        ansvarligSystem={person.ansvarligSystem}
                        variant={variant}
                        behandlinger={data?.behandlingerPerPeriode}
                        hovedsideData={hovedsideData}
                      />
                    </Accordion.Content>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </section>
        )}
      </div>
    </div>
  );
}
