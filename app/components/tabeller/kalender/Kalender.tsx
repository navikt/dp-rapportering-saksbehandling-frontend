import { Label } from "@navikt/ds-react";

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

function UkeRad({
  dager,
  ukenummer,
  hideWeekLabel = false,
  variant,
}: {
  dager: IRapporteringsperiodeDag[];
  ukenummer: string;
  hideWeekLabel?: boolean;
  variant?: ABTestVariant;
}) {
  return (
    <tr>
      {!hideWeekLabel && (
        <th scope="row">
          <Label size="small">Uke {ukenummer}</Label>
        </th>
      )}
      {dager.map((dag) => (
        <Dag key={dag.dato} dag={dag} variant={variant} />
      ))}
    </tr>
  );
}

export function Kalender({
  periode,
  variant = null,
  hideWeekLabels = false,
  layout = "vertical",
}: IProps) {
  if (!periode) return null;

  const forsteUke = periode.dager.slice(0, 7);
  const andreUke = periode.dager.slice(7, 14);
  const ukedager = getWeekDays();
  const [forsteUkenummer, andreUkenummer] = ukenummer(periode).split("-");

  // Variant A (null eller eksplisitt "A"): alltid vertikal layout (ukene stablet)
  const isVariantA = variant === "A" || variant === null;
  if (isVariantA) {
    return (
      <table className={stylesOriginal.kalenderTabell}>
        <caption className="sr-only">
          Oversikt over rapporterte dager for uke {forsteUkenummer} og {andreUkenummer}
        </caption>
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
            variant={variant}
          />
          <tr>
            <td colSpan={7} className={stylesOriginal.mellomrom} aria-hidden="true" />
          </tr>
          <UkeRad
            dager={andreUke}
            ukenummer={andreUkenummer}
            hideWeekLabel={hideWeekLabels}
            variant={variant}
          />
        </tbody>
      </table>
    );
  }

  // Horisontal layout: ukene side ved side (for korriger med Variant B eller original)
  if (layout === "horizontal") {
    return (
      <div className={stylesVariantB.kalenderVariantB}>
        <table className={stylesVariantB.kalenderTabellB}>
          {!hideWeekLabels && (
            <caption className={stylesVariantB.ukeCaption}>
              <Label size="small">Uke {forsteUkenummer}</Label>
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
                <Dag key={dag.dato} dag={dag} variant={variant} />
              ))}
            </tr>
          </tbody>
        </table>

        <table className={stylesVariantB.kalenderTabellB}>
          {!hideWeekLabels && (
            <caption className={stylesVariantB.ukeCaption}>
              <Label size="small">Uke {andreUkenummer}</Label>
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
                <Dag key={dag.dato} dag={dag} variant={variant} />
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
      <caption className="sr-only">
        Oversikt over rapporterte dager for uke {forsteUkenummer} og {andreUkenummer}
      </caption>
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
          variant={variant}
        />
        <tr>
          <td colSpan={7} className={stylesOriginal.mellomrom} aria-hidden="true" />
        </tr>
        <UkeRad
          dager={andreUke}
          ukenummer={andreUkenummer}
          hideWeekLabel={hideWeekLabels}
          variant={variant}
        />
      </tbody>
    </table>
  );
}
