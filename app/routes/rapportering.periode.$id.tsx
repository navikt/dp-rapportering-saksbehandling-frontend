import invariant from "tiny-invariant";

import { hentPeriode } from "~/models/rapporteringsperiode.server";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ periode: IRapporteringsperiode }> {
  invariant(params.id, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periode = await hentPeriode(request, params.id);
  // TODO: Håndter feil i hentRapporteringsperioder
  return { periode };
}

export default function Periode({ params }: Route.ComponentProps) {
  return <div>{params.id}</div>;
}
