import { BodyLong, BodyShort, Button, Heading } from "@navikt/ds-react";

import type { ABTestVariant } from "~/utils/ab-test.utils";
import { buildVariantURL } from "~/utils/ab-test.utils";
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
}

export function MeldekortVisning({ perioder, personId, ansvarligSystem, variant }: IProps) {
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

    return (
      <section
        key={periode.id}
        aria-labelledby={`periode-${periode.id}`}
        className={`${styles.root} ${erTilUtfylling ? styles["root--tomt"] : ""}`}
      >
        {erTilUtfylling ? (
          <>
            <div className={styles.tomtMeldekort}>
              <BodyShort>Dette meldekortet er ikke fylt ut enda.</BodyShort>
            </div>
            {kanSendes && (
              <div>
                <Button as="a" href={fyllUtUrl} className={styles.korrigerKnapp} size="small">
                  Fyll ut meldekort
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <Heading level="3" id={`periode-${periode.id}`} size="small">
                Uke {uker}
              </Heading>
              <BodyLong size="small">
                <time dateTime={fraOgMed}>{formattertFraOgMed}</time> -{" "}
                <time dateTime={tilOgMed}>{formattertTilOgMed}</time>
              </BodyLong>
            </div>
            <div className={styles.innhold}>
              <KalenderOgAktiviteter periode={periode} variant={variant} />
              <UtvidetInfo
                key={periode.id}
                periode={periode}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
                variant={variant}
              />
            </div>
          </>
        )}
      </section>
    );
  });
}
