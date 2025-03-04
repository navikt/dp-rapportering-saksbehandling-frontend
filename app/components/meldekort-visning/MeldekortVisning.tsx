import type { IRapporteringsperiode } from "~/utils/types";
import { Forhandsvisning } from "./Forhandsvisning";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function MeldekortVisning({ perioder }: IProps) {
  return (
    <div>
      {perioder.map((periode) => (
        <div key={periode.id} className="meldekort">
          <Forhandsvisning periode={periode} />
        </div>
      ))}
    </div>
  );
}
