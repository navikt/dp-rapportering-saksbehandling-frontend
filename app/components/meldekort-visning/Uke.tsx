import { formatterDag } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";

interface IProps {
  uke: IRapporteringsperiodeDag[];
}

export function Uke({ uke }: IProps) {
  if (!uke || uke.length === 0) return null;

  return (
    <tr>
      {uke.map((dag) => (
        <td key={dag.dato}>
          <span>{formatterDag(dag.dato)}</span>
        </td>
      ))}
    </tr>
  );
}
