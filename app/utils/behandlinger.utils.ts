import type { IBehandlingsresultat, IOpplysning, IPengeVerdi } from "./behandlingsresultat.types";
import type { IPeriode } from "./behandlingsresultat.types";
import { DATA_TYPE, RAPPORTERINGSPERIODE_STATUS } from "./constants";
import type { IRapporteringsperiode } from "./types";

export interface IBehandlingsresultatPeriodeMedMeta<T> extends IPeriode<T> {
  oppgaveId: string;
  behandlingsId: string;
  regelsettId: string;
  opplysningsId: string;
}

export interface IBehandlingerPerPeriode {
  [periodeId: string]: IBehandlingsresultatPeriodeMedMeta<IPengeVerdi>[];
}

const pengerSomSkalUtbetalesOpplysningsId = "01994cfd-9a27-762e-81fa-61f550467c95";

export function overlapper(
  a: { fraOgMed: string; tilOgMed: string },
  b: { fraOgMed?: string; tilOgMed?: string },
): boolean {
  if (b.fraOgMed && b.tilOgMed) {
    return a.fraOgMed <= b.tilOgMed && a.tilOgMed >= b.fraOgMed;
  }

  // Åpen slutt (gyldigTilOgMed mangler)
  if (b.fraOgMed && !b.tilOgMed) {
    return a.tilOgMed >= b.fraOgMed;
  }

  // Åpen start (gyldigFraOgMed mangler)
  if (!b.fraOgMed && b.tilOgMed) {
    return a.fraOgMed <= b.tilOgMed;
  }

  // Fullt åpent intervall → overlapper alltid
  return true;
}

export function finnBehandlingerForPerioder(
  perioder: IRapporteringsperiode[],
  behandlinger: IBehandlingsresultat[],
): IBehandlingerPerPeriode {
  // https://saksbehandling-dagpenger.ansatt.nav.no/oppgave/:oppgaveId/dagpenger-rett/:behandlingsId/_person/regelsett/:regelsettId/opplysning/:opplysningsId
  const pengerSomSkalUtbetalesOpplysninger = behandlinger
    .map((behandling) => {
      return (
        behandling.opplysninger.filter(
          (opplysning) => opplysning.opplysningTypeId === pengerSomSkalUtbetalesOpplysningsId,
        ) as IOpplysning<typeof DATA_TYPE.PENGER, IPengeVerdi>[]
      )
        .map((opplysning) =>
          // TODO: Vi må finne oppgaveId og regelsettId
          opplysning.perioder.map((periode) => ({
            ...periode,
            oppgaveId: "1",
            behandlingsId: behandling.behandlingId,
            regelsettsId: "1",
            opplysningsId: opplysning.opplysningTypeId,
          })),
        )
        .flat();
    })
    .flat();

  const perioderSomOverlapper = perioder.map((periode) => {
    if (periode.status !== RAPPORTERINGSPERIODE_STATUS.Innsendt) {
      return [periode.id, []];
    }

    return [
      periode.id,
      pengerSomSkalUtbetalesOpplysninger.filter((opplysning) =>
        overlapper(
          { fraOgMed: periode.periode.fraOgMed, tilOgMed: periode.periode.tilOgMed },
          { fraOgMed: opplysning.gyldigFraOgMed, tilOgMed: opplysning.gyldigTilOgMed },
        ),
      ),
    ];
  });

  return Object.fromEntries(perioderSomOverlapper);
}
