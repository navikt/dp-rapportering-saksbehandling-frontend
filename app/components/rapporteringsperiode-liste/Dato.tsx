import { formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

export function Dato({ periode, kort }: { periode: IRapporteringsperiode; kort?: boolean }) {
  return (
    <>
      {formatterDato({ dato: periode.periode.fraOgMed, kort })}
      {" - "}
      {formatterDato({ dato: periode.periode.tilOgMed, kort })}
    </>
  );
}
