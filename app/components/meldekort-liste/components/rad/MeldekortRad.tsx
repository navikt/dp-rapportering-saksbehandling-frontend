import { Table, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { MeldekortVisning } from "~/components/meldekort-visning/MeldekortVisning";
import aktivitetStyles from "~/styles/aktiviteter.module.css";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { QUERY_PARAMS } from "~/utils/constants";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { aktivitetMapping, sorterAktiviteter, unikeAktiviteter } from "../../utils";
import {
  FOCUS_DELAY_MS,
  HIGHLIGHT_DELAY_MS,
  HIGHLIGHT_DURATION_MS,
  REMOVE_HIGHLIGHT_DELAY_MS,
  SCROLL_DELAY_MS,
} from "./MeldekortRad.constants";
import {
  erPeriodeKorrigert,
  erPeriodeOpprettet,
  erPeriodeOpprettetAvArena,
  getStatusConfig,
  skalViseInnsendtInfo,
} from "./MeldekortRad.helpers";
import styles from "./meldekortRad.module.css";

interface Props {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  togglePlacement?: "left" | "right";
  variant?: ABTestVariant;
  allePerioder?: IRapporteringsperiode[];
}

export function MeldekortRad({
  periode,
  personId,
  ansvarligSystem,
  togglePlacement = "left",
  variant = null,
  allePerioder = [],
}: Props) {
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

  // States
  const erOpprettet = erPeriodeOpprettet(periode);
  const erKorrigert = erPeriodeKorrigert(periode);
  const erFraArena = erPeriodeOpprettetAvArena(periode);
  const periodeDatoTekst = `${formatterDato({ dato: periode.periode.fraOgMed })} - ${formatterDato({ dato: periode.periode.tilOgMed })}`;

  // Sjekk om denne perioden har en korrigering
  const harKorrigering = allePerioder.some(
    (p) => p.originalMeldekortId === periode.id && p.id !== periode.id,
  );

  // Variant B: Endre tekster for korrigering
  const useVariantLabels = variant === "B";

  // Visningsverdier
  const statusConfig = getStatusConfig(periode);
  const skalViseInnsendt = skalViseInnsendtInfo(periode);
  const erSendtForSent = skalViseInnsendt && erMeldekortSendtForSent(periode);
  const aktiviteter = sorterAktiviteter(unikeAktiviteter(periode));

  // Highlight-effekt og åpne rad basert på query params
  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);
    const rapporteringsId = searchParams.get(QUERY_PARAMS.RAPPORTERINGSID);

    if (oppdatertId === periode.id) {
      setIsHighlighted(true);
      const highlightTimer = setTimeout(() => setIsHighlighted(false), HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(highlightTimer);
    }

    // Scroll, highlight, og fokuser toggle-knapp hvis denne perioden matcher rapporteringsid
    if (rapporteringsId === periode.id && rowRef.current) {
      const timers: NodeJS.Timeout[] = [];

      // 1. Start scroll med kort delay
      const scrollTimer = setTimeout(() => {
        // Respekter prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        rowRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
      }, SCROLL_DELAY_MS);
      timers.push(scrollTimer);

      // 2. Vis highlight etter at scroll er i gang
      const highlightTimer = setTimeout(() => {
        setIsHighlighted(true);
      }, HIGHLIGHT_DELAY_MS);
      timers.push(highlightTimer);

      // 3. Fokuser på toggle-knappen etter highlight har vist seg
      const focusTimer = setTimeout(() => {
        // Finn toggle-knappen i raden og sett fokus
        const toggleButton = rowRef.current?.querySelector(
          "button[aria-expanded]",
        ) as HTMLButtonElement;
        if (toggleButton) {
          toggleButton.focus();
        }
      }, FOCUS_DELAY_MS);
      timers.push(focusTimer);

      // 4. Fjern highlight etter total tid
      const removeHighlightTimer = setTimeout(() => {
        setIsHighlighted(false);
      }, REMOVE_HIGHLIGHT_DELAY_MS);
      timers.push(removeHighlightTimer);

      return () => timers.forEach((timer) => clearTimeout(timer));
    }
  }, [searchParams, periode.id]);

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

  return (
    <Table.ExpandableRow
      ref={rowRef}
      togglePlacement={togglePlacement}
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
            />
          </article>
        )
      }
      className={radKlasse}
      expandOnRowClick={!erOpprettet}
      expansionDisabled={erOpprettet}
    >
      <Table.DataCell scope="row" {...cellProps}>
        {ukenummer(periode)}
      </Table.DataCell>
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
          {aktiviteter.map((type) => (
            <li
              key={type}
              className={`${styles.aktivitet} ${aktivitetStyles[aktivitetMapping[type].color]}`}
            >
              <span aria-hidden="true">{aktivitetMapping[type].label}</span>
              <span className="sr-only">{aktivitetMapping[type].aria}</span>
            </li>
          ))}
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
