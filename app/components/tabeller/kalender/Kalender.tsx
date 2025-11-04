import { Label } from "@navikt/ds-react";

import type { ABTestVariant } from "~/utils/ab-test.utils";
import { getWeekDays, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

import { Dag } from "./components/Dag";
import stylesOriginal from "./kalender.module.css";
import stylesVariantB from "./kalenderVariantB.module.css";
import stylesVariantC from "./kalenderVariantC.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  variant?: ABTestVariant;
}

function UkeRad({
  dager,
  ukenummer,
  showLabel = false,
}: {
  dager: IRapporteringsperiodeDag[];
  ukenummer: string;
  showLabel?: boolean;
}) {
  return (
    <tr>
      <th scope="row" className={showLabel ? stylesVariantC.ukeLabel : "sr-only"}>
        {showLabel ? <Label size="small">Uke {ukenummer}</Label> : `Uke ${ukenummer}`}
      </th>
      {dager.map((dag) => (
        <Dag key={dag.dato} dag={dag} />
      ))}
    </tr>
  );
}

export function Kalender({ periode, variant = null }: IProps) {
  if (!periode) return null;

  const forsteUke = periode.dager.slice(0, 7);
  const andreUke = periode.dager.slice(7, 14);
  const ukedager = getWeekDays();
  const [forsteUkenummer, andreUkenummer] = ukenummer(periode).split("-");

  // Variant B: Weeks side by side (horizontal layout)
  if (variant === "B") {
    return (
      <div className={stylesVariantB.kalenderVariantB}>
        <table className={stylesVariantB.kalenderTabellB}>
          <caption className={stylesVariantB.ukeCaption}>
            <Label size="small">Uke {forsteUkenummer}</Label>
          </caption>
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
          <caption className={stylesVariantB.ukeCaption}>
            <Label size="small">Uke {andreUkenummer}</Label>
          </caption>
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

  // Variant C: Weeks stacked with visible week labels
  if (variant === "C") {
    return (
      <table className={stylesVariantC.kalenderTabellC}>
        <caption className="sr-only">Oversikt over rapporterte dager for perioden</caption>
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              Uke
            </th>
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
          <UkeRad dager={forsteUke} ukenummer={forsteUkenummer} showLabel={true} />
          <tr>
            <td colSpan={8} className={stylesVariantC.mellomrom} aria-hidden="true" />
          </tr>
          <UkeRad dager={andreUke} ukenummer={andreUkenummer} showLabel={true} />
        </tbody>
      </table>
    );
  }

  // Original/Variant A: Default stacked layout
  return (
    <table className={stylesOriginal.kalenderTabell}>
      <caption className="sr-only">Oversikt over rapporterte dager for perioden</caption>
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Ukedag
          </th>
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
        <UkeRad dager={forsteUke} ukenummer={forsteUkenummer} />
        <tr>
          <td colSpan={7} className={stylesOriginal.mellomrom} aria-hidden="true" />
        </tr>
        <UkeRad dager={andreUke} ukenummer={andreUkenummer} />
      </tbody>
    </table>
  );
}
