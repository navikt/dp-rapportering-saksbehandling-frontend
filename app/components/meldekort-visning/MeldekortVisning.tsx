import type { IRapporteringsperiode } from "~/utils/types";
import { Forhandsvisning } from "./Forhandsvisning";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function MeldekortVisning({ perioder }: IProps) {
  return (
    <div>
      <h2>Forhåndsvisning</h2>
      {perioder.map((periode) => (
        <Forhandsvisning key={periode.id} periode={periode} />
      ))}
    </div>
  );
}
