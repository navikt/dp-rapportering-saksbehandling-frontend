import { formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

export function Dato({ periode }: { periode: IRapporteringsperiode }) {
  return (
    <>
      {formatterDato({ dato: periode.periode.fraOgMed })}
      {" - "}
      {formatterDato({ dato: periode.periode.tilOgMed })}
    </>
  );
}
