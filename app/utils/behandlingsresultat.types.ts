import type { DATA_TYPE, ENHET, OPPRINNELSE } from "./constants";

type TOpprinnelse = (typeof OPPRINNELSE)[keyof typeof OPPRINNELSE];

type TEnhet = (typeof ENHET)[keyof typeof ENHET];

interface ITekstVerdi {
  verdi: string;
  datatype: typeof DATA_TYPE.TEKST;
}

interface IDatoVerdi {
  verdi: string;
  datatype: typeof DATA_TYPE.DATO;
}

interface IHeltallVerdi {
  verdi: number;
  datatype: typeof DATA_TYPE.HELTALL;
  enhet?: TEnhet;
}

interface IDesimalVerdi {
  verdi: number;
  datatype: typeof DATA_TYPE.DESIMALTALL;
  enhet?: TEnhet;
}

interface IPengeVerdi {
  verdi: number;
  datatype: typeof DATA_TYPE.PENGER;
}

interface IUlidVerdi {
  verdi: string;
  datatype: typeof DATA_TYPE.ULID;
}

interface IBoolskVerdi {
  verdi: boolean;
  datatype: typeof DATA_TYPE.BOOLSK;
}

interface IPeriodeVerdi {
  fom: string;
  tom: string;
  datatype: typeof DATA_TYPE.PERIODE;
}

interface IBarneliste {
  søknadBarnId: string;
  verdi: string | unknown[];
  datatype: typeof DATA_TYPE.BARN;
}

interface IBehandlingsresultatPeriodeKilde {
  type: string;
  registrert: string;
  meldingId?: string;
  ident?: string;
  begrunnelse?: {
    verdi: string;
    sistEndret: string;
  };
}

interface IBehandlingsresultatPeriodeUtledetAv {
  regel: {
    navn: string;
  };
  opplysninger: string[];
  versjon: string;
}

interface IBehandlingsresultatPeriode {
  id: string;
  opprettet: string;
  status: TOpprinnelse;
  opprinnelse?: TOpprinnelse;
  gyldigFraOgMed?: string;
  gyldigTilOgMed?: string;
  kilde?: IBehandlingsresultatPeriodeKilde;
  utledetAv?: IBehandlingsresultatPeriodeUtledetAv;
}

interface IBehandlingsresultatPeriodeTekstVerdi extends IBehandlingsresultatPeriode {
  verdi: ITekstVerdi;
}

interface IBehandlingsresultatPeriodeDatoVerdi extends IBehandlingsresultatPeriode {
  verdi: IDatoVerdi;
}

interface IBehandlingsresultatPeriodeHeltallVerdi extends IBehandlingsresultatPeriode {
  verdi: IHeltallVerdi;
}

interface IBehandlingsresultatPeriodeDesimalVerdi extends IBehandlingsresultatPeriode {
  verdi: IDesimalVerdi;
}

interface IBehandlingsresultatPeriodePenger extends IBehandlingsresultatPeriode {
  verdi: IPengeVerdi;
}

interface IBehandlingsresultatPeriodeUlidVerdi extends IBehandlingsresultatPeriode {
  verdi: IUlidVerdi;
}

interface IBehandlingsresultatPeriodeBoolskVerdi extends IBehandlingsresultatPeriode {
  verdi: IBoolskVerdi;
}

interface IBehandlingsresultatPeriodePeriodeVerdi extends IBehandlingsresultatPeriode {
  verdi: IPeriodeVerdi;
}

interface IBehandlingsresultatPeriodeBarneliste extends IBehandlingsresultatPeriode {
  verdi: IBarneliste;
}

interface IBehandlingsresultatOpplysning {
  opplysningTypeId: string;
  navn: string;
  synlig?: boolean;
  redigerbar?: boolean;
  redigertAvSaksbehandler?: boolean;
  formål: "Register" | "Bruker" | "Regel" | "Legacy";
}

interface IBehandlingsresultatOpplysningTekst extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.TEKST;
  perioder: IBehandlingsresultatPeriodeTekstVerdi[];
}

interface IBehandlingsresultatOpplysningDato extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.DATO;
  perioder: IBehandlingsresultatPeriodeDatoVerdi[];
}

interface IBehandlingsresultatOpplysningHeltall extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.HELTALL;
  perioder: IBehandlingsresultatPeriodeHeltallVerdi[];
}

interface IBehandlingsresultatOpplysningDesimal extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.DESIMALTALL;
  perioder: IBehandlingsresultatPeriodeDesimalVerdi[];
}

interface IBehandlingsresultatOpplysningPenger extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.PENGER;
  perioder: IBehandlingsresultatPeriodePenger[];
}

interface IBehandlingsresultatOpplysningUlid extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.ULID;
  perioder: IBehandlingsresultatPeriodeUlidVerdi[];
}

interface IBehandlingsresultatOpplysningBoolsk extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.BOOLSK;
  perioder: IBehandlingsresultatPeriodeBoolskVerdi[];
}

interface IBehandlingsresultatOpplysningPeriode extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.PERIODE;
  perioder: IBehandlingsresultatPeriodePeriodeVerdi[];
}

interface IBehandlingsresultatOpplysningBarn extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.BARN;
  perioder: IBehandlingsresultatPeriodeBarneliste[];
}

interface IBehandlingsresultatOpplysningInntekt extends IBehandlingsresultatOpplysning {
  datatype: typeof DATA_TYPE.INNTEKT;
  perioder: IBehandlingsresultatPeriodeTekstVerdi[];
}

interface IBehandlingsresultatRettighetsperiode {
  fraOgMed: string;
  tilOgMed?: string;
  harRett: boolean;
  opprinnelse?: TOpprinnelse;
}

export interface IBehandlingsresultat {
  behandlingId: string;
  behandletHendelse: {
    datatype: string;
    id: string;
    type: string;
    skjedde: string;
  };
  basertPå?: string;
  automatisk: boolean;
  ident: string;
  rettighetsperioder: IBehandlingsresultatRettighetsperiode[];
  kreverTotrinnskontroll: boolean;
  tilstand: string;
  avklaringer: unknown[];
  vilkår: unknown[];
  opplysninger: Array<
    | IBehandlingsresultatOpplysningTekst
    | IBehandlingsresultatOpplysningDato
    | IBehandlingsresultatOpplysningHeltall
    | IBehandlingsresultatOpplysningDesimal
    | IBehandlingsresultatOpplysningPenger
    | IBehandlingsresultatOpplysningUlid
    | IBehandlingsresultatOpplysningBoolsk
    | IBehandlingsresultatOpplysningPeriode
    | IBehandlingsresultatOpplysningBarn
    | IBehandlingsresultatOpplysningInntekt
  >;
  fastsettelser: unknown[];
}
