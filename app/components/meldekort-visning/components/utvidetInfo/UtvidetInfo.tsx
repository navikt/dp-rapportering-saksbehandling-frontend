import { Alert, BodyLong, Button, Link, Table } from "@navikt/ds-react";
import { format } from "date-fns";
import { useLayoutEffect, useRef, useState } from "react";

import {
  erPeriodeEtterregistrert,
  erPeriodeOpprettetAvArena,
} from "~/components/meldekort-liste/components/rad/MeldekortRad.helpers";
import type { IMeldekortHovedside } from "~/sanity/sider/hovedside/types";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { buildVariantURL } from "~/utils/ab-test.utils";
import { erMeldekortInnenforBehandlingsperiode } from "~/utils/behandlinger.utils";
import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { DatoFormat, formatterDato, formatterDatoUTC } from "~/utils/dato.utils";
import { deepMerge } from "~/utils/deep-merge.utils";
import { skalViseArbeidssokerSporsmal } from "~/utils/meldekort-validering.helpers";
import { dagerForSent, erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import {
  erKildeSaksbehandler,
  erMeldekortKorrigert,
  kanMeldekortEndres,
  pluraliserDager,
} from "./UtvidetInfo.helpers";
import styles from "./utvidetInfo.module.css";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_LABELS = {
  meldedato: "Meldedato:",
  datoForInnsending: "Dato for innsending:",
  datoForKorrigering: "Dato for korrigering:",
  korrigertAv: "Korrigert av:",
  innsendtAv: "Innsendt av:",
  begrunnelse: {
    label: "Begrunnelse:",
    visMer: "Vis mer",
    visMindre: "Vis mindre",
  },
  svarPaaArbeidssoekerregistrering: "Svar på spørsmål om arbeidssøkerregistrering:",
  beregnetBruttobelop: "Beregnet bruttobeløp:",
  periodenBeregningenGjelderFor: "Perioden beregningen gjelder for:",
};

const DEFAULT_VARSLER = {
  forSentInnsendt: "Dette meldekortet er sendt inn {{antall}} {{dager}} etter fristen.",
  fraArena:
    "Dette meldekortet er fra Arena og vi viser derfor ikke svar på spørsmålet om arbeidssøkerregistrering.",
  etterregistrert:
    "Dette meldekortet er etterregistrert, og har derfor ikke spørsmål om arbeidssøkerregistrering.",
  kanIkkeEndres: "Dette meldekortet har en korrigering og kan derfor ikke endres igjen.",
  belopSamsvarerIkke:
    "Brutto beregnet beløp for dette meldekortet samsvarer ikke med meldekortperioden. Du kan se beregningen for meldekortet i DP-sak.",
};

interface IProps {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  variant?: ABTestVariant;
  behandlinger?: IBehandlingsresultatPeriodeMedMeta<IPengeVerdi>[];
  hovedsideData?: IMeldekortHovedside | null;
}

const MAX_LINES = 4;

const NOK = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

const TruncatedText = ({
  text,
  visMer = "Vis mer",
  visMindre = "Vis mindre",
}: {
  text: string;
  visMer?: string;
  visMindre?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (textRef.current) {
      // Sjekk om teksten er kuttet av ved å sammenligne scrollHeight med clientHeight
      const isClamped = textRef.current.scrollHeight > textRef.current.clientHeight;
      setShowButton(isClamped);
    }
  }, [text]);

  return (
    <>
      <span
        ref={textRef}
        aria-live="polite"
        className={isExpanded ? "" : styles.truncatedText}
        style={
          !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: MAX_LINES,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </span>
      {showButton && (
        <>
          {" "}
          <Link
            as="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.visMerLink}
            aria-expanded={isExpanded}
          >
            {isExpanded ? visMindre : visMer}
          </Link>
        </>
      )}
    </>
  );
};

const DetailRow = ({
  label,
  children,
  alignTop = false,
}: {
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) => (
  <Table.Row className={alignTop ? styles.alignTop : undefined} shadeOnHover={false}>
    <Table.HeaderCell scope="row">
      <BodyLong size="small" className={styles.label}>
        {label}
      </BodyLong>
    </Table.HeaderCell>
    <Table.DataCell>
      <BodyLong size="small" className={styles.value}>
        {children}
      </BodyLong>
    </Table.DataCell>
  </Table.Row>
);

export function UtvidetInfo({
  periode,
  personId,
  ansvarligSystem,
  variant = null,
  behandlinger,
  hovedsideData,
}: IProps) {
  // Periode states
  const erEtterregistrert = erPeriodeEtterregistrert(periode);
  const erFraArena = erPeriodeOpprettetAvArena(periode);
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = erMeldekortKorrigert(periode);
  const kanEndres = kanMeldekortEndres(periode, ansvarligSystem);
  const erSendtForSent = erMeldekortSendtForSent(periode);
  const antallDagerForSent = dagerForSent(periode);
  const erSaksbehandler = erKildeSaksbehandler(periode);
  const useVariantLabels = variant === "B";

  // Bruk Sanity-data hvis tilgjengelig, ellers bruk defaults
  const labels = deepMerge(DEFAULT_LABELS, hovedsideData?.utvidetVisning.infoLabels);
  const tabellTittel =
    hovedsideData?.utvidetVisning.tabellTittel ?? "Detaljert informasjon om meldekortet";
  const varsler = deepMerge(DEFAULT_VARSLER, hovedsideData?.varsler);
  const korrigerKnapp = hovedsideData?.knapper.korrigerMeldekort ?? "Korriger meldekort";

  // Bruk samme logikk som i skjemaet for å bestemme om arbeidssøkerspørsmål skal vises
  const skalViseArbeidssoker = skalViseArbeidssokerSporsmal(
    periode.type,
    true, // erSaksbehandlerFlate
    periode.opprettetAv,
  );

  const korrigerUrl = buildVariantURL(
    `/person/${personId}/periode/${periode.id}/korriger`,
    variant ?? null,
  );

  const formatDato = (dato: string) =>
    formatterDato({
      dato,
      format: DatoFormat.DagMndAarLang,
    });

  const formatDatoUTC = (dato: string) =>
    formatterDatoUTC({
      dato,
      format: DatoFormat.DagMndAarLang,
    });

  // Sjekk behandlingsinfo
  const harBehandling =
    behandlinger?.length === 1 && erMeldekortInnenforBehandlingsperiode(periode, behandlinger[0]);

  const belopSamsvarerIkke =
    (behandlinger && behandlinger.length > 1) ||
    (behandlinger &&
      behandlinger.length > 0 &&
      !erMeldekortInnenforBehandlingsperiode(periode, behandlinger[0]));

  return (
    <div className={styles.root}>
      {/* Informasjonstabell */}
      <Table size="small" className={styles.detaljer}>
        <caption className="sr-only">{tabellTittel}</caption>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <Table.Body>
          {/* Dato og innsendings-info */}
          {periode.meldedato && (
            <DetailRow label={labels.meldedato}>{formatDato(periode.meldedato)}</DetailRow>
          )}

          {periode.innsendtTidspunkt && (
            <DetailRow label={erKorrigert ? labels.datoForKorrigering : labels.datoForInnsending}>
              {formatDatoUTC(periode.innsendtTidspunkt)}
            </DetailRow>
          )}

          {(erKorrigert || erSaksbehandler) && (
            <DetailRow label={erKorrigert ? labels.korrigertAv : labels.innsendtAv}>
              {erSaksbehandler ? periode.kilde?.ident : periode.kilde?.rolle}
            </DetailRow>
          )}

          {/* Begrunnelse */}
          {periode.begrunnelse && (
            <DetailRow label={labels.begrunnelse.label} alignTop>
              <TruncatedText
                text={periode.begrunnelse}
                visMer={labels.begrunnelse.visMer}
                visMindre={labels.begrunnelse.visMindre}
              />
            </DetailRow>
          )}

          {/* Arbeidssøker-spørsmål */}
          {periode.registrertArbeidssoker !== null &&
            periode.registrertArbeidssoker !== undefined &&
            skalViseArbeidssoker && (
              <DetailRow label={labels.svarPaaArbeidssoekerregistrering}>
                {erArbeidssoker ? "Ja" : "Nei"}
              </DetailRow>
            )}

          {/* Behandlingsbeløp */}
          {harBehandling && (
            <>
              <DetailRow label={labels.beregnetBruttobelop}>
                {behandlinger!.map((behandling) => (
                  <span key={behandling.id}>{NOK.format(behandling.verdi.verdi)} </span>
                ))}
              </DetailRow>
              <DetailRow label={labels.periodenBeregningenGjelderFor}>
                {behandlinger!.map((behandling) => (
                  <span key={behandling.id}>
                    {behandling.gyldigFraOgMed &&
                      `${format(new Date(behandling.gyldigFraOgMed), "dd.MM.yyyy")} - `}
                    {behandling.gyldigTilOgMed &&
                      `${format(new Date(behandling.gyldigTilOgMed), "dd.MM.yyyy")} `}
                  </span>
                ))}
              </DetailRow>
            </>
          )}
        </Table.Body>
      </Table>

      {/* Varsler */}
      {erSendtForSent && (
        <Alert variant="warning" size="small">
          {varsler.forSentInnsendt
            .replace("{{antall}}", String(antallDagerForSent))
            .replace("{{dager}}", pluraliserDager(antallDagerForSent))}
        </Alert>
      )}

      {erFraArena && (
        <Alert variant="info" size="small">
          {varsler.fraArena}
        </Alert>
      )}

      {erEtterregistrert && (
        <Alert variant="info" size="small">
          {varsler.etterregistrert}
        </Alert>
      )}

      {useVariantLabels && !kanEndres && (
        <Alert variant="info" size="small">
          {varsler.kanIkkeEndres}
        </Alert>
      )}

      {belopSamsvarerIkke && (
        <Alert variant="warning" size="small">
          {varsler.belopSamsvarerIkke}
        </Alert>
      )}

      {/* Korriger-knapp */}
      {(useVariantLabels || kanEndres) && (
        <div>
          <Button
            as="a"
            href={korrigerUrl}
            className={styles.korrigerKnapp}
            size="small"
            disabled={useVariantLabels && !kanEndres}
          >
            {korrigerKnapp}
          </Button>
        </div>
      )}
    </div>
  );
}
