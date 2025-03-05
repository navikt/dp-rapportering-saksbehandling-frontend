import type { IRapporteringsperiodeDag } from "~/utils/types";
import { Dag } from "./Dag";

interface IProps {
  uke: IRapporteringsperiodeDag[];
}

export function Uke({ uke }: IProps) {
  if (!uke?.length) return null;

  return (
    <tr>
      {uke.map((dag) => (
        <Dag key={dag.dato} dag={dag} />
      ))}
    </tr>
  );
}
