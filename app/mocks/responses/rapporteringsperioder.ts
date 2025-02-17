import {
  EAktivitetType,
  ERapporteringsperiodeStatus,
  ERapporteringstype,
  type IRapporteringsperiode,
} from "~/utils/types";

const periode1: IRapporteringsperiode = {
  id: "0194f44e-befd-7974-b48f-250353c1ff09",
  periode: { fraOgMed: "2025-01-27", tilOgMed: "2025-02-09" },
  dager: [
    { dagIndex: 0, dato: "2025-01-27", aktiviteter: [] },
    { dagIndex: 1, dato: "2025-01-28", aktiviteter: [] },
    { dagIndex: 2, dato: "2025-01-29", aktiviteter: [] },
    { dagIndex: 3, dato: "2025-01-30", aktiviteter: [] },
    { dagIndex: 4, dato: "2025-01-31", aktiviteter: [] },
    { dagIndex: 5, dato: "2025-02-01", aktiviteter: [] },
    { dagIndex: 6, dato: "2025-02-02", aktiviteter: [] },
    { dagIndex: 7, dato: "2025-02-03", aktiviteter: [] },
    { dagIndex: 8, dato: "2025-02-04", aktiviteter: [] },
    { dagIndex: 9, dato: "2025-02-05", aktiviteter: [] },
    { dagIndex: 10, dato: "2025-02-06", aktiviteter: [] },
    { dagIndex: 11, dato: "2025-02-07", aktiviteter: [] },
    { dagIndex: 12, dato: "2025-02-08", aktiviteter: [] },
    { dagIndex: 13, dato: "2025-02-09", aktiviteter: [] },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-08",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.SkalIkkeBeregnes,
  mottattDato: "2025-02-10",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harIngenAktivitet,
};

const periode2: IRapporteringsperiode = {
  id: "0194f454-2d83-7e31-a09d-bf6d8f330c35",
  periode: {
    fraOgMed: "2025-01-27",
    tilOgMed: "2025-02-09",
  },
  dager: [
    {
      dagIndex: 0,
      dato: "2025-01-27",
      aktiviteter: [],
    },
    {
      dagIndex: 1,
      dato: "2025-01-28",
      aktiviteter: [
        {
          id: "0194f454-4cbb-7040-af1c-79db5529197c",
          type: EAktivitetType.Arbeid,
          dato: "2025-01-28",
          timer: "PT2H",
        },
      ],
    },
    {
      dagIndex: 2,
      dato: "2025-01-29",
      aktiviteter: [
        {
          id: "0194f454-6d3f-777a-9efd-6146d4d41189",
          type: EAktivitetType.Syk,
          dato: "2025-01-29",
        },
        {
          id: "0194f454-6d3f-777a-9efd-61475f2e60ad",
          type: EAktivitetType.Fravaer,
          dato: "2025-01-29",
        },
        {
          id: "0194f454-6d3f-777a-9efd-614898dd12e2",
          type: EAktivitetType.Utdanning,
          dato: "2025-01-29",
        },
      ],
    },
    {
      dagIndex: 3,
      dato: "2025-01-30",
      aktiviteter: [],
    },
    {
      dagIndex: 4,
      dato: "2025-01-31",
      aktiviteter: [],
    },
    {
      dagIndex: 5,
      dato: "2025-02-01",
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2025-02-02",
      aktiviteter: [
        {
          id: "0194f454-9761-7f51-b9c4-fc251615888c",
          type: EAktivitetType.Fravaer,
          dato: "2025-02-02",
        },
      ],
    },
    {
      dagIndex: 7,
      dato: "2025-02-03",
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2025-02-04",
      aktiviteter: [],
    },
    {
      dagIndex: 9,
      dato: "2025-02-05",
      aktiviteter: [],
    },
    {
      dagIndex: 10,
      dato: "2025-02-06",
      aktiviteter: [
        {
          id: "0194f454-8680-70d5-bfea-edbfd36bed91",
          type: EAktivitetType.Arbeid,
          dato: "2025-02-06",
          timer: "PT1H",
        },
        {
          id: "0194f454-8680-70d5-bfea-edc05e0444cf",
          type: EAktivitetType.Utdanning,
          dato: "2025-02-06",
        },
      ],
    },
    {
      dagIndex: 11,
      dato: "2025-02-07",
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2025-02-08",
      aktiviteter: [],
    },
    {
      dagIndex: 13,
      dato: "2025-02-09",
      aktiviteter: [],
    },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-08",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.FeilVedBeregning,
  mottattDato: "2025-02-20",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harAktivitet,
};

const periode3: IRapporteringsperiode = {
  id: "0194f457-9b33-765a-9ef9-4db728c5a239",
  periode: {
    fraOgMed: "2025-02-17",
    tilOgMed: "2025-03-02",
  },
  dager: [
    {
      dagIndex: 0,
      dato: "2025-01-27",
      aktiviteter: [],
    },
    {
      dagIndex: 1,
      dato: "2025-01-28",
      aktiviteter: [],
    },
    {
      dagIndex: 2,
      dato: "2025-01-29",
      aktiviteter: [
        {
          id: "0194f458-06e4-7bc6-87d3-b509a73d154c",
          type: EAktivitetType.Arbeid,
          dato: "2025-01-29",
          timer: "PT5H",
        },
      ],
    },
    {
      dagIndex: 3,
      dato: "2025-01-30",
      aktiviteter: [
        {
          id: "0194f458-0ed2-7f92-a300-68d834abec47",
          type: EAktivitetType.Utdanning,
          dato: "2025-01-30",
        },
      ],
    },
    {
      dagIndex: 4,
      dato: "2025-01-31",
      aktiviteter: [
        {
          id: "0194f458-21d6-7754-b776-700225f6ccc7",
          type: EAktivitetType.Syk,
          dato: "2025-01-31",
        },
        {
          id: "0194f458-21d6-7754-b776-7003d55d0ebc",
          type: EAktivitetType.Fravaer,
          dato: "2025-01-31",
        },
      ],
    },
    {
      dagIndex: 5,
      dato: "2025-02-01",
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2025-02-02",
      aktiviteter: [],
    },
    {
      dagIndex: 7,
      dato: "2025-02-03",
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2025-02-04",
      aktiviteter: [
        {
          id: "0194f457-f7ad-7526-b684-ea7a32f2e2ea",
          type: EAktivitetType.Syk,
          dato: "2025-02-04",
        },
      ],
    },
    {
      dagIndex: 9,
      dato: "2025-02-05",
      aktiviteter: [
        {
          id: "0194f457-e2f9-7126-abc9-b0c6c460bdd3",
          type: EAktivitetType.Syk,
          dato: "2025-02-05",
        },
      ],
    },
    {
      dagIndex: 10,
      dato: "2025-02-06",
      aktiviteter: [
        {
          id: "0194f457-ed10-7011-85b2-2687eed84e94",
          type: EAktivitetType.Syk,
          dato: "2025-02-06",
        },
      ],
    },
    {
      dagIndex: 11,
      dato: "2025-02-07",
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2025-02-08",
      aktiviteter: [],
    },
    {
      dagIndex: 13,
      dato: "2025-02-09",
      aktiviteter: [
        {
          id: "0194f458-3048-73d1-b773-3a9933d2c60c",
          type: EAktivitetType.Fravaer,
          dato: "2025-02-09",
        },
      ],
    },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-08",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.BeregningUtført,
  mottattDato: "2025-03-03",
  registrertArbeidssoker: false,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harAktivitet,
};

const periode4: IRapporteringsperiode = {
  id: "0194f45a-b518-7e7b-80fb-70627fd31ee1",
  periode: {
    fraOgMed: "2025-01-27",
    tilOgMed: "2025-02-09",
  },
  dager: [
    {
      dagIndex: 0,
      dato: "2025-01-27",
      aktiviteter: [],
    },
    {
      dagIndex: 1,
      dato: "2025-01-28",
      aktiviteter: [],
    },
    {
      dagIndex: 2,
      dato: "2025-01-29",
      aktiviteter: [],
    },
    {
      dagIndex: 3,
      dato: "2025-01-30",
      aktiviteter: [
        {
          id: "0194f45a-dac9-7da0-bbe3-77df36751b0d",
          type: EAktivitetType.Syk,
          dato: "2025-01-30",
        },
      ],
    },
    {
      dagIndex: 4,
      dato: "2025-01-31",
      aktiviteter: [
        {
          id: "0194f45a-e446-7901-b500-b215a8e29ad9",
          type: EAktivitetType.Syk,
          dato: "2025-01-31",
        },
      ],
    },
    {
      dagIndex: 5,
      dato: "2025-02-01",
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2025-02-02",
      aktiviteter: [],
    },
    {
      dagIndex: 7,
      dato: "2025-02-03",
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2025-02-04",
      aktiviteter: [
        {
          id: "0194f45a-ed86-771d-82f7-b8cbe98d3a5a",
          type: EAktivitetType.Fravaer,
          dato: "2025-02-04",
        },
      ],
    },
    {
      dagIndex: 9,
      dato: "2025-02-05",
      aktiviteter: [],
    },
    {
      dagIndex: 10,
      dato: "2025-02-06",
      aktiviteter: [],
    },
    {
      dagIndex: 11,
      dato: "2025-02-07",
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2025-02-08",
      aktiviteter: [],
    },
    {
      dagIndex: 13,
      dato: "2025-02-09",
      aktiviteter: [],
    },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-08",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.BeregningUtført,
  mottattDato: "2025-02-10",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harAktivitet,
};

const periode5: IRapporteringsperiode = {
  id: "0194f459-7fb9-7bd1-9da7-a0ff10e2831a",
  periode: {
    fraOgMed: "2025-01-27",
    tilOgMed: "2025-02-09",
  },
  dager: [
    {
      dagIndex: 0,
      dato: "2025-01-27",
      aktiviteter: [],
    },
    {
      dagIndex: 1,
      dato: "2025-01-28",
      aktiviteter: [
        {
          id: "0194f459-a3f6-770f-ad89-32be817eabb0",
          type: EAktivitetType.Arbeid,
          dato: "2025-01-28",
          timer: "PT2H",
        },
      ],
    },
    {
      dagIndex: 2,
      dato: "2025-01-29",
      aktiviteter: [
        {
          id: "0194f459-b547-7605-8774-d65ad94d93b3",
          type: EAktivitetType.Arbeid,
          dato: "2025-01-29",
          timer: "PT2H",
        },
      ],
    },
    {
      dagIndex: 3,
      dato: "2025-01-30",
      aktiviteter: [
        {
          id: "0194f459-e08e-7eb5-b05f-c6c832b456b5",
          type: EAktivitetType.Arbeid,
          dato: "2025-01-30",
          timer: "PT6H",
        },
      ],
    },
    {
      dagIndex: 4,
      dato: "2025-01-31",
      aktiviteter: [],
    },
    {
      dagIndex: 5,
      dato: "2025-02-01",
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2025-02-02",
      aktiviteter: [],
    },
    {
      dagIndex: 7,
      dato: "2025-02-03",
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2025-02-04",
      aktiviteter: [],
    },
    {
      dagIndex: 9,
      dato: "2025-02-05",
      aktiviteter: [
        {
          id: "0194f45a-11c6-757a-a587-e8fca909e140",
          type: EAktivitetType.Arbeid,
          dato: "2025-02-05",
          timer: "PT6H",
        },
      ],
    },
    {
      dagIndex: 10,
      dato: "2025-02-06",
      aktiviteter: [],
    },
    {
      dagIndex: 11,
      dato: "2025-02-07",
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2025-02-08",
      aktiviteter: [],
    },
    {
      dagIndex: 13,
      dato: "2025-02-09",
      aktiviteter: [],
    },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-08",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.MeldekortOpprettet,
  mottattDato: "2025-02-10",
  registrertArbeidssoker: true,
  originalId: null,
  rapporteringstype: ERapporteringstype.harAktivitet,
  html: null,
};

const periode6: IRapporteringsperiode = {
  id: "0194f45b-7fb9-7bd1-9da7-a0ff10e2831b",
  periode: {
    fraOgMed: "2025-02-10",
    tilOgMed: "2025-02-23",
  },
  dager: [
    { dagIndex: 0, dato: "2025-02-10", aktiviteter: [] },
    { dagIndex: 1, dato: "2025-02-11", aktiviteter: [] },
    { dagIndex: 2, dato: "2025-02-12", aktiviteter: [] },
    { dagIndex: 3, dato: "2025-02-13", aktiviteter: [] },
    { dagIndex: 4, dato: "2025-02-14", aktiviteter: [] },
    { dagIndex: 5, dato: "2025-02-15", aktiviteter: [] },
    { dagIndex: 6, dato: "2025-02-16", aktiviteter: [] },
    { dagIndex: 7, dato: "2025-02-17", aktiviteter: [] },
    { dagIndex: 8, dato: "2025-02-18", aktiviteter: [] },
    { dagIndex: 9, dato: "2025-02-19", aktiviteter: [] },
    { dagIndex: 10, dato: "2025-02-20", aktiviteter: [] },
    { dagIndex: 11, dato: "2025-02-21", aktiviteter: [] },
    { dagIndex: 12, dato: "2025-02-22", aktiviteter: [] },
    { dagIndex: 13, dato: "2025-02-23", aktiviteter: [] },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-22",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.SkalIkkeBeregnes,
  mottattDato: "2025-02-24",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harIngenAktivitet,
};

const periode7: IRapporteringsperiode = {
  id: "0194f45c-7fb9-7bd1-9da7-a0ff10e2831c",
  periode: {
    fraOgMed: "2025-02-10",
    tilOgMed: "2025-02-23",
  },
  dager: [
    { dagIndex: 0, dato: "2025-02-10", aktiviteter: [] },
    { dagIndex: 1, dato: "2025-02-11", aktiviteter: [] },
    { dagIndex: 2, dato: "2025-02-12", aktiviteter: [] },
    { dagIndex: 3, dato: "2025-02-13", aktiviteter: [] },
    { dagIndex: 4, dato: "2025-02-14", aktiviteter: [] },
    { dagIndex: 5, dato: "2025-02-15", aktiviteter: [] },
    { dagIndex: 6, dato: "2025-02-16", aktiviteter: [] },
    { dagIndex: 7, dato: "2025-02-17", aktiviteter: [] },
    { dagIndex: 8, dato: "2025-02-18", aktiviteter: [] },
    { dagIndex: 9, dato: "2025-02-19", aktiviteter: [] },
    { dagIndex: 10, dato: "2025-02-20", aktiviteter: [] },
    { dagIndex: 11, dato: "2025-02-21", aktiviteter: [] },
    { dagIndex: 12, dato: "2025-02-22", aktiviteter: [] },
    { dagIndex: 13, dato: "2025-02-23", aktiviteter: [] },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-22",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.SkalIkkeBeregnes,
  mottattDato: "2025-02-24",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harIngenAktivitet,
};

const periode8: IRapporteringsperiode = {
  id: "0194f45d-7fb9-7bd1-9da7-a0ff10e2831d",
  periode: {
    fraOgMed: "2025-02-10",
    tilOgMed: "2025-02-23",
  },
  dager: [
    { dagIndex: 0, dato: "2025-02-10", aktiviteter: [] },
    { dagIndex: 1, dato: "2025-02-11", aktiviteter: [] },
    { dagIndex: 2, dato: "2025-02-12", aktiviteter: [] },
    { dagIndex: 3, dato: "2025-02-13", aktiviteter: [] },
    { dagIndex: 4, dato: "2025-02-14", aktiviteter: [] },
    { dagIndex: 5, dato: "2025-02-15", aktiviteter: [] },
    { dagIndex: 6, dato: "2025-02-16", aktiviteter: [] },
    { dagIndex: 7, dato: "2025-02-17", aktiviteter: [] },
    { dagIndex: 8, dato: "2025-02-18", aktiviteter: [] },
    { dagIndex: 9, dato: "2025-02-19", aktiviteter: [] },
    { dagIndex: 10, dato: "2025-02-20", aktiviteter: [] },
    { dagIndex: 11, dato: "2025-02-21", aktiviteter: [] },
    { dagIndex: 12, dato: "2025-02-22", aktiviteter: [] },
    { dagIndex: 13, dato: "2025-02-23", aktiviteter: [] },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-22",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.SkalIkkeBeregnes,
  mottattDato: "2025-02-24",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harIngenAktivitet,
};

const periode9: IRapporteringsperiode = {
  id: "0194f45e-7fb9-7bd1-9da7-a0ff10e2831e",
  periode: {
    fraOgMed: "2025-02-10",
    tilOgMed: "2025-02-23",
  },
  dager: [
    { dagIndex: 0, dato: "2025-02-10", aktiviteter: [] },
    { dagIndex: 1, dato: "2025-02-11", aktiviteter: [] },
    { dagIndex: 2, dato: "2025-02-12", aktiviteter: [] },
    { dagIndex: 3, dato: "2025-02-13", aktiviteter: [] },
    { dagIndex: 4, dato: "2025-02-14", aktiviteter: [] },
    { dagIndex: 5, dato: "2025-02-15", aktiviteter: [] },
    { dagIndex: 6, dato: "2025-02-16", aktiviteter: [] },
    { dagIndex: 7, dato: "2025-02-17", aktiviteter: [] },
    { dagIndex: 8, dato: "2025-02-18", aktiviteter: [] },
    { dagIndex: 9, dato: "2025-02-19", aktiviteter: [] },
    { dagIndex: 10, dato: "2025-02-20", aktiviteter: [] },
    { dagIndex: 11, dato: "2025-02-21", aktiviteter: [] },
    { dagIndex: 12, dato: "2025-02-22", aktiviteter: [] },
    { dagIndex: 13, dato: "2025-02-23", aktiviteter: [] },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-22",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.SkalIkkeBeregnes,
  mottattDato: "2025-02-24",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harIngenAktivitet,
};

const periode10: IRapporteringsperiode = {
  id: "0194f45f-7fb9-7bd1-9da7-a0ff10e2831f",
  periode: {
    fraOgMed: "2025-02-10",
    tilOgMed: "2025-02-23",
  },
  dager: [
    { dagIndex: 0, dato: "2025-02-10", aktiviteter: [] },
    { dagIndex: 1, dato: "2025-02-11", aktiviteter: [] },
    { dagIndex: 2, dato: "2025-02-12", aktiviteter: [] },
    { dagIndex: 3, dato: "2025-02-13", aktiviteter: [] },
    { dagIndex: 4, dato: "2025-02-14", aktiviteter: [] },
    { dagIndex: 5, dato: "2025-02-15", aktiviteter: [] },
    { dagIndex: 6, dato: "2025-02-16", aktiviteter: [] },
    { dagIndex: 7, dato: "2025-02-17", aktiviteter: [] },
    { dagIndex: 8, dato: "2025-02-18", aktiviteter: [] },
    { dagIndex: 9, dato: "2025-02-19", aktiviteter: [] },
    { dagIndex: 10, dato: "2025-02-20", aktiviteter: [] },
    { dagIndex: 11, dato: "2025-02-21", aktiviteter: [] },
    { dagIndex: 12, dato: "2025-02-22", aktiviteter: [] },
    { dagIndex: 13, dato: "2025-02-23", aktiviteter: [] },
  ],
  sisteFristForTrekk: null,
  kanSendesFra: "2025-02-22",
  kanSendes: true,
  kanEndres: true,
  bruttoBelop: null,
  begrunnelseEndring: "",
  status: ERapporteringsperiodeStatus.SkalIkkeBeregnes,
  mottattDato: "2025-02-24",
  registrertArbeidssoker: true,
  originalId: null,
  html: null,
  rapporteringstype: ERapporteringstype.harIngenAktivitet,
};

export default [
  periode1,
  periode2,
  periode3,
  periode4,
  periode5,
  periode6,
  periode7,
  periode8,
  periode9,
  periode10,
];
