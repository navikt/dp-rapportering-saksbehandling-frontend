import type { IRapporteringsperiode } from "~/utils/types";
import { Forhandsvisning } from "./Forhandsvisning";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function MeldekortVisning({ perioder }: IProps) {
  return (
    <div>
      {perioder.map((periode) => (
        <div key={periode.id}>
          <Forhandsvisning periode={perioder[0]} />
        </div>
      ))}
    </div>
  );
}
