import { Label } from "@navikt/ds-react";

import { useGlobalSanityData } from "~/hooks/useGlobalSanityData";
import { sanityTekst } from "~/sanity/utils";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { getWeekDays, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

import { Dag } from "./components/Dag";
import stylesOriginal from "./kalender.module.css";
import stylesVariantB from "./kalenderVariantB.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  variant?: ABTestVariant;
  hideWeekLabels?: boolean;
  layout?: "horizontal" | "vertical";
}

function formatWeekLabel(weekLabel: string, weekNumber: string): string {
  const template = weekLabel.trim();
  const replaced = template.replaceAll("{{uke}}", weekNumber).replaceAll("{{uker}}", weekNumber);

  if (template.length === 0) return weekNumber;
  return replaced === template ? `${template} ${weekNumber}` : replaced;
}

function UkeRad({
  dager,
  ukenummer,
  hideWeekLabel = false,
  weekLabel = "",
}: {
  dager: IRapporteringsperiodeDag[];
  ukenummer: string;
  hideWeekLabel?: boolean;
  weekLabel?: string;
}) {
  const formattedWeekLabel = formatWeekLabel(weekLabel ?? "", ukenummer);

  return (
    <tr>
      {!hideWeekLabel && (
        <th scope="row">
          <Label size="small">{formattedWeekLabel}</Label>
        </th>
      )}
      {dager.map((dag) => (
        <Dag key={dag.dato} dag={dag} />
      ))}
    </tr>
  );
}

export function Kalender({
  periode,
  variant = null,
  hideWeekLabels = false,
  layout = "horizontal",
}: IProps) {
  if (!periode) return null;

  const sanityData = useGlobalSanityData();
  const kalenderData = sanityData?.kalender;

  const forsteUke = periode.dager.slice(0, 7);
  const andreUke = periode.dager.slice(7, 14);

  // Bruk kalenderdata fra Sanity hvis tilgjengelig, ellers fall tilbake til getWeekDays()
  const ukedager = kalenderData
    ? [
        { kort: kalenderData.ukedager.monday.short, lang: kalenderData.ukedager.monday.long },
        { kort: kalenderData.ukedager.tuesday.short, lang: kalenderData.ukedager.tuesday.long },
        {
          kort: kalenderData.ukedager.wednesday.short,
          lang: kalenderData.ukedager.wednesday.long,
        },
        { kort: kalenderData.ukedager.thursday.short, lang: kalenderData.ukedager.thursday.long },
        { kort: kalenderData.ukedager.friday.short, lang: kalenderData.ukedager.friday.long },
        { kort: kalenderData.ukedager.saturday.short, lang: kalenderData.ukedager.saturday.long },
        { kort: kalenderData.ukedager.sunday.short, lang: kalenderData.ukedager.sunday.long },
      ]
    : getWeekDays();

  const [forsteUkenummer, andreUkenummer] = ukenummer(periode).split("-");

  const weekLabel = sanityTekst(kalenderData?.weekLabel, "kalender.weekLabel");
  const tableCaption = sanityTekst(kalenderData?.tableCaption, "kalender.tableCaption");

  // Original: alltid vertikal layout (ukene stablet)
  if (variant === null) {
    return (
      <table className={stylesOriginal.kalenderTabell}>
        <caption className="sr-only">{tableCaption}</caption>
        <thead>
          <tr>
            {!hideWeekLabels && (
              <th scope="col" className="sr-only">
                Ukedag
              </th>
            )}
            {ukedager.map((ukedag, index) => (
              <th key={`${periode.id}-${index}`} scope="col">
                <Label size="small" as="span">
                  <span aria-hidden="true">{ukedag.kort}</span>
                  <span className="sr-only">{ukedag.lang}</span>
                </Label>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <UkeRad
            dager={forsteUke}
            ukenummer={forsteUkenummer}
            hideWeekLabel={hideWeekLabels}
            weekLabel={weekLabel}
          />
          <tr>
            <td colSpan={7} className={stylesOriginal.mellomrom} aria-hidden="true" />
          </tr>
          <UkeRad
            dager={andreUke}
            ukenummer={andreUkenummer}
            hideWeekLabel={hideWeekLabels}
            weekLabel={weekLabel}
          />
        </tbody>
      </table>
    );
  }

  // Horisontal layout: ukene side ved side (for korrigering)
  if (layout === "horizontal") {
    return (
      <div className={stylesVariantB.kalenderVariantB}>
        <table className={stylesVariantB.kalenderTabellB}>
          {!hideWeekLabels && (
            <caption className={stylesVariantB.ukeCaption}>
              <Label size="small">{formatWeekLabel(weekLabel, forsteUkenummer)}</Label>
            </caption>
          )}
          <thead>
            <tr>
              {ukedager.map((ukedag, index) => (
                <th key={`uke1-${index}`} scope="col">
                  <Label size="small" as="span">
                    <span aria-hidden="true">{ukedag.kort}</span>
                    <span className="sr-only">{ukedag.lang}</span>
                  </Label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {forsteUke.map((dag) => (
                <Dag key={dag.dato} dag={dag} />
              ))}
            </tr>
          </tbody>
        </table>

        <table className={stylesVariantB.kalenderTabellB}>
          {!hideWeekLabels && (
            <caption className={stylesVariantB.ukeCaption}>
              <Label size="small">{formatWeekLabel(weekLabel, andreUkenummer)}</Label>
            </caption>
          )}
          <thead>
            <tr>
              {ukedager.map((ukedag, index) => (
                <th key={`uke2-${index}`} scope="col">
                  <Label size="small" as="span">
                    <span aria-hidden="true">{ukedag.kort}</span>
                    <span className="sr-only">{ukedag.lang}</span>
                  </Label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {andreUke.map((dag) => (
                <Dag key={dag.dato} dag={dag} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Vertikal layout: ukene stablet (for meldekortvisning - default)
  return (
    <table className={stylesOriginal.kalenderTabell}>
      <caption className="sr-only">{tableCaption}</caption>
      <thead>
        <tr>
          {!hideWeekLabels && (
            <th scope="col" className="sr-only">
              Ukedag
            </th>
          )}
          {ukedager.map((ukedag, index) => (
            <th key={`${periode.id}-${index}`} scope="col">
              <Label size="small" as="span">
                <span aria-hidden="true">{ukedag.kort}</span>
                <span className="sr-only">{ukedag.lang}</span>
              </Label>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <UkeRad
          dager={forsteUke}
          ukenummer={forsteUkenummer}
          hideWeekLabel={hideWeekLabels}
          weekLabel={weekLabel}
        />
        <tr>
          <td colSpan={7} className={stylesOriginal.mellomrom} aria-hidden="true" />
        </tr>
        <UkeRad
          dager={andreUke}
          ukenummer={andreUkenummer}
          hideWeekLabel={hideWeekLabels}
          weekLabel={weekLabel}
        />
      </tbody>
    </table>
  );
}
