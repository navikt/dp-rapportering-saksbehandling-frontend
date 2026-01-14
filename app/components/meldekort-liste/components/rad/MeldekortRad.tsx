import { Table, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { MeldekortVisning } from "~/components/meldekort-visning/MeldekortVisning";
import aktivitetStyles from "~/styles/aktiviteter.module.css";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { QUERY_PARAMS } from "~/utils/constants";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { aktivitetMapping, sorterAktiviteter, unikeAktiviteter } from "../../utils";
import {
  HIGHLIGHT_DELAY_MS,
  HIGHLIGHT_DURATION_MS,
  REMOVE_HIGHLIGHT_DELAY_MS,
  SCROLL_DELAY_MS,
} from "./MeldekortRad.constants";
import {
  erPeriodeKorrigert,
  erPeriodeOpprettet,
  erPeriodeOpprettetAvArena,
  formaterPeriodeDatoer,
  getStatusConfig,
  periodeHarKorrigering,
  skalViseInnsendtInfo,
} from "./MeldekortRad.helpers";
import styles from "./meldekortRad.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  togglePlacement?: "left" | "right";
  variant?: ABTestVariant;
  allePerioder?: IRapporteringsperiode[];
  behandlinger?: IBehandlingsresultatPeriodeMedMeta<IPengeVerdi>[];
}

export function MeldekortRad({
  periode,
  personId,
  ansvarligSystem,
  togglePlacement = "left",
  variant = null,
  allePerioder = [],
  behandlinger,
}: IProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean | undefined>(undefined);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const hasAutoOpenedRef = useRef(false);

  // States
  const erOpprettet = erPeriodeOpprettet(periode);
  const erKorrigert = erPeriodeKorrigert(periode);
  const erFraArena = erPeriodeOpprettetAvArena(periode);
  const periodeDatoTekst = formaterPeriodeDatoer(
    periode.periode.fraOgMed,
    periode.periode.tilOgMed,
    formatterDato,
  );
  const harKorrigering = periodeHarKorrigering(periode, allePerioder);

  // Variant B: Endre tekster for korrigering
  const useVariantLabels = variant === "B";

  // Visningsverdier
  const statusConfig = getStatusConfig(periode, behandlinger);
  const skalViseInnsendt = skalViseInnsendtInfo(periode);
  const erSendtForSent = skalViseInnsendt && erMeldekortSendtForSent(periode);
  const aktiviteter = sorterAktiviteter(unikeAktiviteter(periode));

  // Highlight-effekt når meldekort er oppdatert
  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);
    if (oppdatertId === periode.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [searchParams, periode.id]);

  // Auto-åpne, scroll og highlight når meldekort matcher URL (kun ved første lasting)
  useEffect(() => {
    const rapporteringsId = searchParams.get(QUERY_PARAMS.RAPPORTERINGSID);
    const meldekortId = searchParams.get(QUERY_PARAMS.MELDEKORT_ID);
    const shouldAutoOpen = rapporteringsId === periode.id || meldekortId === periode.id;

    // Kun kjør auto-open logikk hvis vi ikke allerede har åpnet denne raden
    if (!shouldAutoOpen || hasAutoOpenedRef.current) {
      return;
    }

    // Marker at vi har auto-åpnet denne raden
    hasAutoOpenedRef.current = true;

    // Åpne raden umiddelbart
    setIsOpen(true);

    // Hvis rowRef ikke er tilgjengelig ennå, bare åpne raden (uten scroll/fokus)
    if (!rowRef.current) {
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    // Smooth scroll til meldekortet
    const scrollTimer = setTimeout(() => {
      if (rowRef.current) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        rowRef.current.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
      }
    }, SCROLL_DELAY_MS);
    timers.push(scrollTimer);

    // Fokuser på toggle-knappen (uten å scrolle igjen)
    const focusTimer = setTimeout(() => {
      if (rowRef.current) {
        const toggleButton = rowRef.current.querySelector(
          "button[aria-expanded]",
        ) as HTMLButtonElement;
        toggleButton?.focus({ preventScroll: true });
      }
    }, SCROLL_DELAY_MS + 200);
    timers.push(focusTimer);

    // Vis highlight
    const highlightTimer = setTimeout(() => {
      setIsHighlighted(true);
    }, HIGHLIGHT_DELAY_MS);
    timers.push(highlightTimer);

    // Fjern highlight
    const removeHighlightTimer = setTimeout(() => {
      setIsHighlighted(false);
    }, REMOVE_HIGHLIGHT_DELAY_MS);
    timers.push(removeHighlightTimer);

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []); // Kun kjør denne effekten én gang ved mount

  const radKlasse = classNames({
    [styles["periodeListe__row"]]: true,
    [styles["periodeListe__row--highlighted"]]: isHighlighted,
    [styles["periodeListe__row--disabled"]]: erOpprettet,
  });

  // Felles props for celler
  const cellProps = {
    textSize: "small" as const,
    className: radKlasse,
  };

  // Håndter manuell åpning/lukking av rad og synkroniser med URL
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    const newSearchParams = new URLSearchParams(searchParams);
    if (open) {
      newSearchParams.set(QUERY_PARAMS.MELDEKORT_ID, periode.id);
    } else {
      newSearchParams.delete(QUERY_PARAMS.MELDEKORT_ID);
    }

    setSearchParams(newSearchParams, { replace: true, preventScrollReset: true });
  };

  return (
    <Table.ExpandableRow
      ref={rowRef}
      togglePlacement={togglePlacement}
      open={isOpen}
      onOpenChange={handleOpenChange}
      content={
        !erOpprettet && (
          <article
            key={periode.id}
            aria-label={`Periode ${periode.periode.fraOgMed}`}
            className={styles.visningContainer}
          >
            <MeldekortVisning
              perioder={[periode]}
              personId={personId}
              ansvarligSystem={ansvarligSystem}
              variant={variant}
              behandlinger={behandlinger}
            />
          </article>
        )
      }
      className={radKlasse}
      expandOnRowClick={!erOpprettet}
      expansionDisabled={erOpprettet}
    >
      <Table.HeaderCell scope="row" {...cellProps}>
        {ukenummer(periode)}
      </Table.HeaderCell>
      <Table.DataCell {...cellProps}>{periodeDatoTekst}</Table.DataCell>
      <Table.DataCell {...cellProps}>
        <div className={styles.statusContainer}>
          <Tag variant={statusConfig.variant} size="small">
            {statusConfig.text}
          </Tag>
          {erKorrigert && (
            <Tag variant="info" size="small">
              Korrigering
            </Tag>
          )}

          {!erKorrigert && harKorrigering && useVariantLabels && (
            <Tag variant="warning" size="small">
              Korrigert
            </Tag>
          )}

          {erFraArena && (
            <Tag variant="info" size="small">
              Arena
            </Tag>
          )}
        </div>
      </Table.DataCell>
      <Table.DataCell {...cellProps}>
        <ul className={styles.aktiviteter}>
          {aktiviteter.map((type) => {
            const colorClass = aktivitetMapping[type].color;
            return (
              <li key={type} className={`${styles.aktivitet} ${aktivitetStyles[colorClass]}`}>
                <span aria-hidden="true">{aktivitetMapping[type].label}</span>
                <span className="sr-only">{aktivitetMapping[type].aria}</span>
              </li>
            );
          })}
        </ul>
      </Table.DataCell>
      <Table.DataCell {...cellProps}>
        {skalViseInnsendt &&
          (erSendtForSent ? (
            <Tag variant="error" size="small">
              {formatterDato({ dato: periode.meldedato! })}
              <span className="sr-only">, sendt inn for sent </span>
            </Tag>
          ) : (
            formatterDato({ dato: periode.meldedato! })
          ))}
      </Table.DataCell>
      <Table.DataCell {...cellProps}>
        {periode.sisteFristForTrekk && formatterDato({ dato: periode.sisteFristForTrekk })}
      </Table.DataCell>
    </Table.ExpandableRow>
  );
}
