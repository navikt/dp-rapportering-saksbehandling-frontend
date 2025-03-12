import type { IRapporteringsperiode } from "~/utils/types";
import { ukenummer } from "~/utils/dato.utils";
import { Uke } from "../rapporteringsperiode-visning/Uke";
import { Tag } from "@navikt/ds-react";

export function UendretPeriode({ periode }: { periode: IRapporteringsperiode }) {
  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);

  return (
    <>
      <Tag variant="neutral">Sist beregnet</Tag>
      <h3>Uke {ukenummer(periode)}</h3>
      <table>
        <tbody>
          <Uke uke={forsteUke} />
          <Uke uke={andreUke} />
        </tbody>
      </table>
    </>
  );
}
