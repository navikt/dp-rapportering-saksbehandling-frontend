import type {
  BEHANDLET_HENTELSE_TYPE,
  DATA_TYPE,
  ENHET,
  FORMAL,
  OPPLYSNINGSKILDE_TYPE,
  OPPRINNELSE,
} from "./constants";

type TOpprinnelse = (typeof OPPRINNELSE)[keyof typeof OPPRINNELSE];

type TEnhet = (typeof ENHET)[keyof typeof ENHET];

type TOpplysningskildeType = (typeof OPPLYSNINGSKILDE_TYPE)[keyof typeof OPPLYSNINGSKILDE_TYPE];

type TFormal = (typeof FORMAL)[keyof typeof FORMAL];

type TBehandletHendelseType =
  (typeof BEHANDLET_HENTELSE_TYPE)[keyof typeof BEHANDLET_HENTELSE_TYPE];

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

interface IBarnVerdi {
  fødselsdato: string;
  fornavnOgMellomnavn?: string;
  etternavn?: string;
  statsborgerskap?: string;
  kvalifiserer: boolean;
}

interface IBarneliste {
  søknadBarnId: string;
  verdi: IBarnVerdi[];
  datatype: typeof DATA_TYPE.BARN;
}

interface IOpplysningskilde {
  type: TOpplysningskildeType;
  registrert: string;
  meldingId?: string;
  ident?: string;
  begrunnelse?: {
    verdi: string;
    sistEndret: string;
  };
}

interface IUtledetAv {
  regel: {
    navn: string;
  };
  opplysninger: string[];
  versjon: string;
}

interface IPeriode<VerdiType> {
  id: string;
  opprettet: string;
  status: TOpprinnelse;
  opprinnelse?: TOpprinnelse;
  gyldigFraOgMed?: string;
  gyldigTilOgMed?: string;
  kilde?: IOpplysningskilde;
  utledetAv?: IUtledetAv;
  verdi: VerdiType;
}

interface IOpplysning<DataType, VerdiType> {
  opplysningTypeId: string;
  navn: string;
  synlig?: boolean;
  redigerbar?: boolean;
  redigertAvSaksbehandler?: boolean;
  formål: TFormal;
  datatype: DataType;
  perioder: IPeriode<VerdiType>[];
}

interface IRettighetsperiode {
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
    type: TBehandletHendelseType;
    skjedde: string;
  };
  basertPå?: string;
  automatisk: boolean;
  ident: string;
  rettighetsperioder: IRettighetsperiode[];
  kreverTotrinnskontroll?: boolean;
  tilstand?: string;
  avklaringer?: unknown[];
  vilkår?: unknown[];
  opplysninger: Array<
    | IOpplysning<typeof DATA_TYPE.TEKST, ITekstVerdi>
    | IOpplysning<typeof DATA_TYPE.DATO, IDatoVerdi>
    | IOpplysning<typeof DATA_TYPE.HELTALL, IHeltallVerdi>
    | IOpplysning<typeof DATA_TYPE.DESIMALTALL, IDesimalVerdi>
    | IOpplysning<typeof DATA_TYPE.PENGER, IPengeVerdi>
    | IOpplysning<typeof DATA_TYPE.ULID, IUlidVerdi>
    | IOpplysning<typeof DATA_TYPE.BOOLSK, IBoolskVerdi>
    | IOpplysning<typeof DATA_TYPE.PERIODE, IPeriodeVerdi>
    | IOpplysning<typeof DATA_TYPE.BARN, IBarneliste>
    | IOpplysning<typeof DATA_TYPE.INNTEKT, ITekstVerdi>
  >;

  fastsettelser?: unknown[];
}
