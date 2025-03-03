import type { IRapporteringsperiode } from "~/utils/types";
import { formatterDag } from "~/utils/dato.utils";

interface IProps {
  periode: IRapporteringsperiode;
  ukeNummer: number;
}

export function Uke({ periode, ukeNummer }: IProps) {
  if (!periode) return null;

  const startDato = new Date(periode.periode.fraOgMed);
  const sluttDato = new Date(periode.periode.tilOgMed);
  const dagerIMellom = (sluttDato.getTime() - startDato.getTime()) / (1000 * 3600 * 24);

  const datoer = Array.from(
    { length: dagerIMellom + 1 },
    (_, i) => new Date(startDato.setDate(startDato.getDate() + i))
  );

  const [startIndex, endIndex] = ukeNummer === 1 ? [0, 7] : [7, 14];

  return (
    <tr>
      {datoer.slice(startIndex, endIndex).map((dato, index) => (
        <td key={`${periode.id}-${index}`}>{formatterDag(dato.toISOString())}</td>
      ))}
    </tr>
  );
}
