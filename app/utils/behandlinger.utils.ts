import type { IBehandlingsresultat, IPengeVerdi } from "./behandlingsresultat.types";
import type { IPeriode as IBehandlingsresultatPeriode } from "./behandlingsresultat.types";
import { RAPPORTERINGSPERIODE_STATUS } from "./constants";
import type { IPeriode, IRapporteringsperiode } from "./types";

export interface IBehandlingerPerPeriode {
  [periodeId: string]: IBehandlingsresultatPeriode<IPengeVerdi>[];
}

const pengerSomSkalUtbetalesOpplysningsId = "01994cfd-9a27-762e-81fa-61f550467c95";

function overlapper(
  periode: IPeriode,
  opplysning: IBehandlingsresultatPeriode<IPengeVerdi>,
): boolean {
  if (opplysning.gyldigFraOgMed && opplysning.gyldigTilOgMed) {
    return (
      periode.fraOgMed <= opplysning.gyldigTilOgMed && periode.tilOgMed >= opplysning.gyldigFraOgMed
    );
  }

  // Åpen slutt (gyldigTilOgMed mangler)
  if (opplysning.gyldigFraOgMed && !opplysning.gyldigTilOgMed) {
    return periode.tilOgMed >= opplysning.gyldigFraOgMed;
  }

  // Åpen start (gyldigFraOgMed mangler)
  if (!opplysning.gyldigFraOgMed && opplysning.gyldigTilOgMed) {
    return periode.fraOgMed <= opplysning.gyldigTilOgMed;
  }

  // Fullt åpent intervall → overlapper alltid
  return true;
}

export function finnBehandlingerForPerioder(
  perioder: IRapporteringsperiode[],
  behandlinger: IBehandlingsresultat[],
): IBehandlingerPerPeriode {
  const pengerSomSkalUtbetalesOpplysninger = behandlinger
    .map(
      (behandling) =>
        behandling.opplysninger
          .filter(
            (opplysning) => opplysning.opplysningTypeId === pengerSomSkalUtbetalesOpplysningsId,
          )
          .map((opplysning) => opplysning.perioder)
          .flat() as unknown as IBehandlingsresultatPeriode<IPengeVerdi>[],
    )
    .flat();

  const perioderSomOverlapper = perioder.map((periode) => {
    if (periode.status !== RAPPORTERINGSPERIODE_STATUS.Innsendt) {
      return [periode.id, []];
    }

    return [
      periode.id,
      pengerSomSkalUtbetalesOpplysninger.filter((opplysning) =>
        overlapper(periode.periode, opplysning),
      ),
    ];
  });

  return Object.fromEntries(perioderSomOverlapper);
}
