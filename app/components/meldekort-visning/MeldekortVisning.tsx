import { BodyLong, BodyShort, Button, Heading } from "@navikt/ds-react";

import type { IMeldekortHovedside } from "~/sanity/sider/hovedside/types";
import { sanityTekst } from "~/sanity/utils";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { buildVariantURL } from "~/utils/ab-test.utils";
import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { KalenderOgAktiviteter } from "./components/kalenderOgAktiviteter/kalenderOgAktiviteter";
import { UtvidetInfo } from "./components/utvidetInfo/UtvidetInfo";
import { erPeriodeTilUtfylling, kanMeldekortSendes } from "./MeldekortVisning.helpers";
import styles from "./meldekortVisning.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  variant?: ABTestVariant;
  behandlinger?: IBehandlingsresultatPeriodeMedMeta<IPengeVerdi>[];
  hovedsideData?: IMeldekortHovedside | null;
}

export function MeldekortVisning({
  perioder,
  personId,
  ansvarligSystem,
  variant,
  behandlinger,
  hovedsideData,
}: IProps) {
  return perioder.map((periode) => {
    const { fraOgMed, tilOgMed } = periode.periode;
    const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
    const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });
    const uker = ukenummer(periode);

    // Sjekk om meldekort er tomt/klar til utfylling
    const erTilUtfylling = erPeriodeTilUtfylling(periode);
    const kanSendes = kanMeldekortSendes(periode, ansvarligSystem);

    const fyllUtUrl = buildVariantURL(
      `/person/${personId}/periode/${periode.id}/fyll-ut`,
      variant ?? null,
    );

    // Hent tekster fra Sanity med fallback til defaults
    const tomtMeldekortTekst = sanityTekst(
      hovedsideData?.utvidetVisning?.emptyCardMessage,
      "hovedside.utvidetVisning.emptyCardMessage",
    );
    const fyllUtKnapp = sanityTekst(
      hovedsideData?.knapper?.fyllutMeldekort,
      "hovedside.knapper.fyllutMeldekort",
    );
    const ukeOverskrift = sanityTekst(
      hovedsideData?.utvidetVisning?.overskrift,
      "hovedside.utvidetVisning.overskrift",
    )
      .replace("{{uker}}", String(uker))
      .replace("{{uke}}", String(uker));

    return (
      <section
        key={periode.id}
        aria-labelledby={`periode-${periode.id}`}
        className={`${styles.root} ${erTilUtfylling ? styles["root--tomt"] : ""}`}
      >
        {erTilUtfylling ? (
          <>
            <div className={styles.tomtMeldekort}>
              <BodyShort>{tomtMeldekortTekst}</BodyShort>
            </div>
            {kanSendes && (
              <div>
                <Button as="a" href={fyllUtUrl} className={styles.korrigerKnapp} size="small">
                  {fyllUtKnapp}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <Heading level="3" id={`periode-${periode.id}`} size="small">
                {ukeOverskrift}
              </Heading>
              <BodyLong size="small">
                <time dateTime={fraOgMed}>{formattertFraOgMed}</time> -{" "}
                <time dateTime={tilOgMed}>{formattertTilOgMed}</time>
              </BodyLong>
            </div>
            <div className={styles.innhold}>
              <KalenderOgAktiviteter
                periode={periode}
                variant={variant}
                aktiviteterTittel={hovedsideData?.utvidetVisning?.aktiviteterTittel}
                noActivitiesText={hovedsideData?.utvidetVisning?.noActivitiesText}
              />
              <UtvidetInfo
                key={periode.id}
                periode={periode}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
                variant={variant}
                behandlinger={behandlinger}
                hovedsideData={hovedsideData}
              />
            </div>
          </>
        )}
      </section>
    );
  });
}
