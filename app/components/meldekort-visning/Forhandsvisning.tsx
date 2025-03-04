import type { IRapporteringsperiode } from "~/utils/types";
import { formatterDato, getWeekDays, ukenummer } from "~/utils/dato.utils";
import { Uke } from "./Uke";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Forhandsvisning({ periode }: IProps) {
  if (!periode) return null;
  console.log(periode);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);

  const ukedager = getWeekDays();

  return (
    <div className="kalender">
      <div>
        <p>
          Uke {ukenummer(periode)}
          <span style={{ display: "block" }}>
            {formattertFraOgMed} - {formattertTilOgMed}
          </span>
        </p>
      </div>
      <table>
        <thead>
          <tr>
            {ukedager.map((ukedag, index) => (
              <th key={`${periode.id}-${index}`}>
                <span>{ukedag.kort}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Uke uke={forsteUke} />
          <Uke uke={andreUke} />
        </tbody>
      </table>
    </div>
  );
}
