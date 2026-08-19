import { Alert, BodyLong, Button, Link, Table, Tag } from "@navikt/ds-react";
import { format } from "date-fns";
import { useLayoutEffect, useRef, useState } from "react";

import {
  erPeriodeEtterregistrert,
  erPeriodeOpprettetAvArena,
} from "~/components/meldekort-liste/components/rad/MeldekortRad.helpers";
import type { IMeldekortHovedside } from "~/sanity/sider/hovedside/types";
import { sanityTekst } from "~/sanity/utils";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { buildVariantURL } from "~/utils/ab-test.utils";
import { erMeldekortInnenforBehandlingsperiode } from "~/utils/behandlinger.utils";
import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { DatoFormat, formatterDato, formatterDatoUTC } from "~/utils/dato.utils";
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

interface IProps {
  periode: IRapporteringsperiode;
  originaltMeldekort?: IRapporteringsperiode;
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
  visMer,
  visMindre,
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
            {isExpanded
              ? sanityTekst(visMindre, "hovedside.utvidetVisning.infoLabels.begrunnelse.visMindre")
              : sanityTekst(visMer, "hovedside.utvidetVisning.infoLabels.begrunnelse.visMer")}
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

  // Sjekk om det er en korrigering av et Arena-meldekort
  const erKorrigeringAvArenaMeldekort = erKorrigert && erPeriodeOpprettetAvArena(periode);

  const labels = hovedsideData?.utvidetVisning?.infoLabels;
  const tabellTittel = sanityTekst(
    hovedsideData?.utvidetVisning?.tabellTittel,
    "hovedside.utvidetVisning.tabellTittel",
  );
  const varsler = hovedsideData?.varsler;
  const korrigerKnapp = sanityTekst(
    hovedsideData?.knapper?.korrigerMeldekort,
    "hovedside.knapper.korrigerMeldekort",
  );

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
            <DetailRow
              label={sanityTekst(
                labels?.meldedato,
                "hovedside.utvidetVisning.infoLabels.meldedato",
              )}
            >
              {formatDato(periode.meldedato)}
            </DetailRow>
          )}

          {periode.innsendtTidspunkt && (
            <DetailRow
              label={
                erKorrigert
                  ? sanityTekst(
                      labels?.datoForKorrigering,
                      "hovedside.utvidetVisning.infoLabels.datoForKorrigering",
                    )
                  : sanityTekst(
                      labels?.datoForInnsending,
                      "hovedside.utvidetVisning.infoLabels.datoForInnsending",
                    )
              }
            >
              {formatDatoUTC(periode.innsendtTidspunkt)}
            </DetailRow>
          )}

          {(erKorrigert || erSaksbehandler) && (
            <DetailRow
              label={
                erKorrigert
                  ? sanityTekst(
                      labels?.korrigertAv,
                      "hovedside.utvidetVisning.infoLabels.korrigertAv",
                    )
                  : sanityTekst(
                      labels?.innsendtAv,
                      "hovedside.utvidetVisning.infoLabels.innsendtAv",
                    )
              }
            >
              {erSaksbehandler ? periode.kilde?.ident : periode.kilde?.rolle}
            </DetailRow>
          )}

          {/* Begrunnelse */}
          {periode.begrunnelse && (
            <DetailRow
              label={sanityTekst(
                labels?.begrunnelse?.label,
                "hovedside.utvidetVisning.infoLabels.begrunnelse.label",
              )}
              alignTop
            >
              <TruncatedText
                text={periode.begrunnelse}
                visMer={labels?.begrunnelse?.visMer}
                visMindre={labels?.begrunnelse?.visMindre}
              />
            </DetailRow>
          )}

          {/* Arbeidssøker-spørsmål */}
          {periode.registrertArbeidssoker !== null &&
            periode.registrertArbeidssoker !== undefined &&
            skalViseArbeidssoker && (
              <DetailRow
                label={sanityTekst(
                  labels?.svarPaaArbeidssoekerregistrering,
                  "hovedside.utvidetVisning.infoLabels.svarPaaArbeidssoekerregistrering",
                )}
              >
                <Tag size="small" variant={erArbeidssoker ? "success" : "error"}>
                  {erArbeidssoker ? "Ja" : "Nei"}
                </Tag>
              </DetailRow>
            )}

          {/* Behandlingsbeløp */}
          {harBehandling && (
            <>
              <DetailRow
                label={sanityTekst(
                  labels?.beregnetBruttobelop,
                  "hovedside.utvidetVisning.infoLabels.beregnetBruttobelop",
                )}
              >
                {behandlinger!.map((behandling) => (
                  <span key={behandling.id}>{NOK.format(behandling.verdi.verdi)} </span>
                ))}
              </DetailRow>
              <DetailRow
                label={sanityTekst(
                  labels?.periodenBeregningenGjelderFor,
                  "hovedside.utvidetVisning.infoLabels.periodenBeregningenGjelderFor",
                )}
              >
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
          {sanityTekst(varsler?.forSentInnsendt, "hovedside.varsler.forSentInnsendt")
            .replace("{{antall}}", String(antallDagerForSent))
            .replace("{{dager}}", pluraliserDager(antallDagerForSent))}
        </Alert>
      )}

      {erFraArena && !erKorrigeringAvArenaMeldekort && (
        <Alert variant="info" size="small">
          {sanityTekst(varsler?.fraArena, "hovedside.varsler.fraArena")}
        </Alert>
      )}

      {erKorrigeringAvArenaMeldekort && (
        <Alert variant="info" size="small">
          {sanityTekst(
            varsler?.korrigeringAvArenaMeldekort,
            "hovedside.varsler.korrigeringAvArenaMeldekort",
          )}
        </Alert>
      )}

      {erEtterregistrert && (
        <Alert variant="info" size="small">
          {sanityTekst(varsler?.etterregistrert, "hovedside.varsler.etterregistrert")}
        </Alert>
      )}

      {useVariantLabels && !kanEndres && (
        <Alert variant="info" size="small">
          {sanityTekst(varsler?.kanIkkeEndres, "hovedside.varsler.kanIkkeEndres")}
        </Alert>
      )}

      {belopSamsvarerIkke && (
        <Alert variant="warning" size="small">
          {sanityTekst(varsler?.belopSamsvarerIkke, "hovedside.varsler.belopSamsvarerIkke")}
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
