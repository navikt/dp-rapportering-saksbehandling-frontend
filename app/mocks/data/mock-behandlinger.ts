import { addDays } from "date-fns";
import { uuidv7 } from "uuidv7";

import { overlapper } from "~/utils/behandlinger.utils";
import type {
  IBehandlingsresultat,
  IPengeVerdi,
  IPeriode,
} from "~/utils/behandlingsresultat.types";
import { OPPRINNELSE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { erMeldekortSendtForSent, sorterMeldekort } from "~/utils/rapporteringsperiode.utils";
import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

export function mockBehandling(
  person: IPerson,
  rapporteringsperioder: IRapporteringsperiode[],
): IBehandlingsresultat {
  const sorterteMeldekort = rapporteringsperioder.sort(sorterMeldekort);
  const dagsats = 1119;

  const pengerSomSkalUtbetales = sorterteMeldekort
    .filter(
      (meldekort) =>
        meldekort.status === RAPPORTERINGSPERIODE_STATUS.Innsendt &&
        !erMeldekortSendtForSent(meldekort) &&
        !meldekort.originalMeldekortId &&
        meldekort.meldedato,
    )
    .reduce(
      (meldekortUtenDuplikatePerioder: IRapporteringsperiode[], meldekort) =>
        meldekortUtenDuplikatePerioder.find(
          (m) =>
            m.periode.fraOgMed === meldekort.periode.fraOgMed &&
            m.periode.tilOgMed === meldekort.periode.tilOgMed,
        )
          ? meldekortUtenDuplikatePerioder
          : [...meldekortUtenDuplikatePerioder, meldekort],
      [],
    )
    .map((meldekort, index): IPeriode<IPengeVerdi> => {
      const status = index > 0 ? OPPRINNELSE.ARVET : OPPRINNELSE.NY;

      return {
        id: uuidv7(),
        opprettet: addDays(new Date(meldekort.meldedato!), 3).toISOString(),
        status,
        opprinnelse: status,
        gyldigFraOgMed: meldekort.periode.fraOgMed,
        gyldigTilOgMed: meldekort.periode.tilOgMed,
        verdi: {
          verdi: Math.min(
            [...meldekort.dager.slice(0, 5), ...meldekort.dager.slice(8)].filter(
              (dag) => dag.aktiviteter.length === 0,
            ).length * dagsats,
            dagsats * 10,
          ),
          datatype: "penger",
        },
      };
    })
    .reverse();

  return {
    behandlingId: "019a91d7-550c-706a-b76d-d0c591621201",
    behandletHendelse: {
      datatype: "String",
      id: "019a91d6-023d-7898-b9d9-47bf613b2cd1",
      type: "Meldekort",
      skjedde: "2025-11-17",
    },
    basertPå: "019a91d6-6a70-7262-b7d5-0d36c3a8ee67",
    automatisk: false,
    ident: person.ident ?? "15870599010",
    rettighetsperioder: [
      {
        fraOgMed: "2025-06-02",
        harRett: true,
        opprinnelse: "Arvet",
      },
    ],
    kreverTotrinnskontroll: false,
    tilstand: "Ferdig",
    avklaringer: [
      {
        id: "019a91d7-550c-706a-b76d-d0c5916211ff",
        kode: "MeldekortBehandling",
        tittel: "Beregning av meldekort",
        beskrivelse: "Behandlingen er opprettet av meldekort og kan ikke automatisk behandles",
        kanKvitteres: true,
        status: "Avklart",
        maskinelt: false,
        begrunnelse: "asdfasdf",
        sistEndret: "2025-11-17T13:43:29.450315",
        avklartAv: {
          ident: "Z994794",
        },
      },
    ],
    vilkår: [
      {
        id: "2099145502",
        navn: "Krav på dagpenger",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "0",
          paragraf: "0",
          tittel: "§ 0-0. Krav på dagpenger",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§0-0",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysninger: ["01990a09-0eab-7957-b88f-14484a50e194"],
      },
      {
        id: "-422034844",
        navn: "Opphold",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "2",
          tittel: "§ 4-2. Opphold i Norge",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-2",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d54e",
        opplysninger: [
          "0196ab10-0cff-7301-99d6-65be50a50201",
          "0194881f-9443-72b4-8b30-5f6cdb24d549",
          "0194881f-9443-72b4-8b30-5f6cdb24d54a",
          "0194881f-9443-72b4-8b30-5f6cdb24d54b",
          "0194881f-9443-72b4-8b30-5f6cdb24d54c",
          "0194881f-9443-72b4-8b30-5f6cdb24d54d",
          "0194881f-9443-72b4-8b30-5f6cdb24d54e",
        ],
      },
      {
        id: "113817629",
        navn: "Tap av arbeidsinntekt og arbeidstid",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "3",
          tittel: "§ 4-3. Tap av arbeidsinntekt og arbeidstid",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-3",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76f",
        opplysninger: [
          "0194881f-9435-72a8-b1ce-9575cbc2a75e",
          "0194881f-9435-72a8-b1ce-9575cbc2a761",
          "019522d6-846d-7173-a892-67f10016d8d2",
          "0194881f-9435-72a8-b1ce-9575cbc2a762",
          "0194881f-9435-72a8-b1ce-9575cbc2a764",
          "0194881f-9435-72a8-b1ce-9575cbc2a765",
          "0194881f-9435-72a8-b1ce-9575cbc2a766",
          "0194881f-9435-72a8-b1ce-9575cbc2a767",
          "0196b4a7-23b5-7b2c-aa95-e4167d900de8",
          "0194881f-9435-72a8-b1ce-9575cbc2a76c",
          "0194881f-9435-72a8-b1ce-9575cbc2a76b",
          "0194881f-9435-72a8-b1ce-9575cbc2a768",
          "0194881f-9435-72a8-b1ce-9575cbc2a76e",
          "0194881f-9435-72a8-b1ce-9575cbc2a763",
          "0194881f-9435-72a8-b1ce-9575cbc2a76f",
        ],
      },
      {
        id: "1917405995",
        navn: "Minsteinntekt",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "4",
          tittel: "§ 4-4. Krav til minsteinntekt",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-4",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f0424c",
        opplysninger: [
          "0194881f-9413-77ce-92ec-d29700f04246",
          "0194881f-9413-77ce-92ec-d29700f04247",
          "0194881f-9413-77ce-92ec-d29700f04244",
          "0194881f-9413-77ce-92ec-d29700f04245",
          "0194881f-9413-77ce-92ec-d29700f04243",
          "0194881f-9413-77ce-92ec-d29700f04241",
          "0194881f-9413-77ce-92ec-d29700f0423f",
          "0194881f-9413-77ce-92ec-d29700f04248",
          "0194881f-9413-77ce-92ec-d29700f0424a",
          "0194881f-9413-77ce-92ec-d29700f04242",
          "0194881f-9413-77ce-92ec-d29700f04240",
          "0194881f-9413-77ce-92ec-d29700f04249",
          "0194881f-9413-77ce-92ec-d29700f0424b",
          "0194881f-9413-77ce-92ec-d29700f0424c",
        ],
      },
      {
        id: "-709778893",
        navn: "Reell arbeidssøker",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "5",
          tittel: "§ 4-5. Reelle arbeidssøkere",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-5",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877be2",
        opplysninger: [
          "0194881f-9435-72a8-b1ce-9575cbc2a75f",
          "0194881f-9435-72a8-b1ce-9575cbc2a769",
          "0194881f-9435-72a8-b1ce-9575cbc2a76d",
          "0194881f-9441-7d1b-a06a-6727543a141e",
          "0194881f-9441-7d1b-a06a-6727543a141f",
          "0194881f-9442-707b-a6ee-e96c06877bd9",
          "0194881f-9442-707b-a6ee-e96c06877bda",
          "0194881f-9442-707b-a6ee-e96c06877bdc",
          "0194929e-2036-7ac1-ada3-5cbe05a83f08",
          "0194881f-9442-707b-a6ee-e96c06877bde",
          "0194881f-9442-707b-a6ee-e96c06877bd8",
          "0194881f-9442-707b-a6ee-e96c06877bdb",
          "0194881f-9442-707b-a6ee-e96c06877bdd",
          "0194881f-9442-707b-a6ee-e96c06877bdf",
          "0194881f-9442-707b-a6ee-e96c06877be2",
        ],
      },
      {
        id: "1355973545",
        navn: "Registrert som arbeidssøker",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "5",
          tittel: "§ 4-5. Reelle arbeidssøkere - registrert som arbeidssøker",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-5",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877be1",
        opplysninger: [
          "0194881f-9442-707b-a6ee-e96c06877be0",
          "0194881f-9442-707b-a6ee-e96c06877be1",
        ],
      },
      {
        id: "-735652124",
        navn: "Utdanning",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "6",
          tittel: "§ 4-6. Dagpenger under utdanning, opplæring, etablering av egen virksomhet m.v",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-6",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b52d",
        opplysninger: [
          "0194881f-9445-734c-a7ee-045edf29b522",
          "0194881f-9445-734c-a7ee-045edf29b527",
          "0194881f-9445-734c-a7ee-045edf29b528",
          "0194881f-9445-734c-a7ee-045edf29b529",
          "0194881f-9445-734c-a7ee-045edf29b52a",
          "0194881f-9445-734c-a7ee-045edf29b52b",
          "0194881f-9445-734c-a7ee-045edf29b52c",
          "0194881f-9445-734c-a7ee-045edf29b523",
          "0194881f-9445-734c-a7ee-045edf29b524",
          "0194881f-9445-734c-a7ee-045edf29b525",
          "0194881f-9445-734c-a7ee-045edf29b526",
          "0194881f-9445-734c-a7ee-045edf29b52d",
        ],
      },
      {
        id: "726763306",
        navn: "Permittering",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "7",
          tittel: "§ 4-7. Dagpenger til permitterte",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-7",
        },
        relevantForResultat: false,
        type: "Vilkår",
        opplysningTypeId: "0194d111-db2f-7395-bcfb-959f245fd2a6",
        opplysninger: [],
      },
      {
        id: "1696849119",
        navn: "Permittering fiskeindustri",
        hjemmel: {
          kilde: {
            navn: "Forskrift til Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "6",
          paragraf: "7",
          tittel:
            "§ 6-7. Permittering i fiskeforedlingsindustrien, sjømatindustrien og fiskeoljeindustrien",
        },
        relevantForResultat: false,
        type: "Vilkår",
        opplysningTypeId: "019522b0-c722-76d4-8d7f-78f556c51f72",
        opplysninger: [],
      },
      {
        id: "1257708498",
        navn: "Meldeplikt",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "8",
          tittel: "§ 4-8. Meldeplikt og møteplikt",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-8",
        },
        relevantForResultat: false,
        type: "Vilkår",
        opplysninger: [],
      },
      {
        id: "443361892",
        navn: "Verneplikt",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "19",
          tittel: "§ 4-19. Dagpenger etter avtjent verneplikt",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-19",
        },
        relevantForResultat: false,
        type: "Vilkår",
        opplysningTypeId: "01948d43-e218-76f1-b29b-7e604241d98a",
        opplysninger: [
          "01948d3c-4bea-7802-9d18-5342a5e2be99",
          "01948d43-e218-76f1-b29b-7e604241d98a",
        ],
      },
      {
        id: "-1464003313",
        navn: "Streik og lock-out",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "22",
          tittel: "§ 4-22. Bortfall ved streik og lock-out",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-22",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-91df-746a-a8ac-4a6b2b30685f",
        opplysninger: [
          "0194881f-91df-746a-a8ac-4a6b2b30685d",
          "0194881f-91df-746a-a8ac-4a6b2b30685e",
          "0194881f-91df-746a-a8ac-4a6b2b30685f",
        ],
      },
      {
        id: "2068170353",
        navn: "Alder",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "23",
          tittel: "§ 4-23. Bortfall på grunn av alder",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-23",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-940b-76ff-acf5-ba7bcb367237",
        opplysninger: [
          "0194881f-940b-76ff-acf5-ba7bcb367233",
          "0194881f-940b-76ff-acf5-ba7bcb367234",
          "0194881f-940b-76ff-acf5-ba7bcb367235",
          "0194881f-940b-76ff-acf5-ba7bcb367236",
          "0194881f-940b-76ff-acf5-ba7bcb367237",
        ],
      },
      {
        id: "649273752",
        navn: "Fulle ytelser",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "24",
          tittel:
            "§ 4-24. Medlem som har fulle ytelser etter folketrygdloven eller avtalefestet pensjon",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-24",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-943f-78d9-b874-00a4944c54f1",
        opplysninger: ["0194881f-943f-78d9-b874-00a4944c54f1"],
      },
      {
        id: "-408080329",
        navn: "Samordning reduserte ytelser",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "25",
          tittel:
            "§ 4-25. Samordning med reduserte ytelser fra folketrygden, eller redusert avtalefestet pensjon",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-25",
        },
        relevantForResultat: false,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86ef",
        opplysninger: [
          "0194881f-9433-70e9-a85b-c246150c45cd",
          "0194881f-9433-70e9-a85b-c246150c45ce",
          "0194881f-9433-70e9-a85b-c246150c45cf",
          "0194881f-9433-70e9-a85b-c246150c45d0",
          "0194881f-9433-70e9-a85b-c246150c45d2",
          "0194881f-9433-70e9-a85b-c246150c45d3",
          "0194881f-9433-70e9-a85b-c246150c45d1",
          "0196afaf-afbd-7079-b2cf-3669ad9d86aa",
          "0194881f-9434-79e8-a64d-1a23cc5d86ed",
          "0194881f-9434-79e8-a64d-1a23cc5d86ee",
          "0194881f-9433-70e9-a85b-c246150c45d4",
          "0194881f-9433-70e9-a85b-c246150c45d5",
          "0194881f-9433-70e9-a85b-c246150c45d6",
          "0194881f-9433-70e9-a85b-c246150c45d7",
          "0194881f-9433-70e9-a85b-c246150c45da",
          "0194881f-9433-70e9-a85b-c246150c45d9",
          "0196afc0-6807-7fa3-83e4-cf7f621f3a7e",
          "0196afbf-e32d-775a-ad10-f476e26dcb6f",
          "0194881f-9434-79e8-a64d-1a23cc5d86e9",
          "0194881f-9434-79e8-a64d-1a23cc5d86eb",
          "0194881f-9434-79e8-a64d-1a23cc5d86ec",
          "0194881f-9434-79e8-a64d-1a23cc5d86ef",
          "0194881f-9434-79e8-a64d-1a23cc5d86ea",
        ],
      },
      {
        id: "-981023914",
        navn: "Utestengning",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "28",
          tittel: "§ 4-28. Utestengning",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-28",
        },
        relevantForResultat: true,
        type: "Vilkår",
        opplysningTypeId: "0194881f-9447-7e36-a569-3e9f42bff9f7",
        opplysninger: [
          "0194881f-9447-7e36-a569-3e9f42bff9f6",
          "0194881f-9447-7e36-a569-3e9f42bff9f7",
        ],
      },
    ],
    fastsettelser: [
      {
        id: "497240064",
        navn: "Meldekortberegning",
        hjemmel: {
          kilde: {
            navn: "Meldekortberegning",
            kortnavn: "Meldekortberegning",
          },
          kapittel: "0",
          paragraf: "0",
          tittel: "§ 0-0. Meldekortberegning",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "01956abd-2871-7517-a332-b462c0c31292",
          "01948ea0-36e8-72cc-aa4f-16bc446ed3bd",
          "01948ea0-e25c-7c47-8429-a05045d80eca",
          "01948ea0-ffdc-7964-ab55-52a7e35e1020",
          "01956ab8-126c-7636-803e-a5d87eda2015",
          "01973a27-d8b3-7ffd-a81a-a3826963b079",
          "01957069-d7d5-7f7c-b359-c00686fbf1f7",
          "01994cfd-9a27-762e-81fa-61f550467c95",
          "01992934-66e4-7606-bdd3-c6c9dd420ffd",
          "01992956-e349-76b1-8f68-c9d481df3a32",
          "01997b70-a12c-7622-bff8-82a20687e640",
          "01997b70-6e6e-702a-a296-18ae5fb9621d",
        ],
      },
      {
        id: "920476734",
        navn: "Rettighetstype",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "0",
          paragraf: "0",
          tittel: "§ 0-0. Rettighetstype",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§0-0",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-9444-7a73-a458-0af81c034d86",
          "0194881f-9444-7a73-a458-0af81c034d85",
          "0194881f-9444-7a73-a458-0af81c034d87",
          "0194881f-9444-7a73-a458-0af81c034d88",
          "0194881f-9444-7a73-a458-0af81c034d89",
          "0194881f-9444-7a73-a458-0af81c034d8a",
          "0194881f-9444-7a73-a458-0af81c034d8b",
          "0194ff86-a035-7eb0-9c60-21899f7cc0c1",
          "01980cf4-9010-7bcf-b578-ca5a825d64ef",
        ],
      },
      {
        id: "1938248916",
        navn: "Søknadstidspunkt",
        hjemmel: {
          kilde: {
            navn: "Forskrift til Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "3",
          paragraf: "1",
          tittel: "§ 3-1. Søknadstidspunkt",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-91d1-7df2-ba1d-4533f37fcc77",
          "0194881f-91d1-7df2-ba1d-4533f37fcc73",
          "0194881f-91d1-7df2-ba1d-4533f37fcc74",
          "0194881f-91d1-7df2-ba1d-4533f37fcc75",
          "0194881f-91d1-7df2-ba1d-4533f37fcc76",
        ],
      },
      {
        id: "1566092562",
        navn: "Opptjeningsperiode",
        hjemmel: {
          kilde: {
            navn: "A-opplysningsloven",
            kortnavn: "a-opplysningsloven",
          },
          kapittel: "1",
          paragraf: "2",
          tittel: "§ 1-2. Frist for levering av opplysninger",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-9414-7823-8d29-0e25b7feb7ce",
          "0194881f-9414-7823-8d29-0e25b7feb7cf",
          "0194881f-9414-7823-8d29-0e25b7feb7d0",
        ],
      },
      {
        id: "-1270428739",
        navn: "Fastsettelse av arbeidstid",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "3",
          tittel: "§ 4-3. Fastsettelse av arbeidstid",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-3",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: ["0194881f-9435-72a8-b1ce-9575cbc2a76a"],
      },
      {
        id: "726763306",
        navn: "Permittering",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "7",
          tittel: "§ 4-7. Dagpenger til permitterte",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-7",
        },
        relevantForResultat: false,
        type: "Fastsettelse",
        opplysninger: [],
      },
      {
        id: "-1955883769",
        navn: "Permittering fiskeindustri",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "6",
          paragraf: "7",
          tittel:
            "§ 6-7. Permittering i fiskeforedlingsindustrien, sjømatindustrien og fiskeoljeindustrien",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§6-7",
        },
        relevantForResultat: false,
        type: "Fastsettelse",
        opplysninger: [],
      },
      {
        id: "-1866856189",
        navn: "Egenandel",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "9",
          tittel: "§ 4-9. Egenandel",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-9",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-943f-78d9-b874-00a4944c54f0",
          "019523aa-7941-7dd2-8c43-0644d7b43f57",
          "0194881f-943f-78d9-b874-00a4944c54ef",
        ],
      },
      {
        id: "-657125179",
        navn: "Dagpengegrunnlag",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "11",
          tittel: "§ 4-11. Dagpengegrunnlag",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-11",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-9410-7481-b263-4606fdd10ca9",
          "0194881f-9410-7481-b263-4606fdd10ca7",
          "0194881f-9410-7481-b263-4606fdd10ca8",
          "0194881f-940f-7af9-9387-052e028b29ee",
          "0194881f-940f-7af9-9387-052e028b29ed",
          "0194881f-940f-7af9-9387-052e028b29ec",
          "0194881f-9410-7481-b263-4606fdd10cad",
          "0194881f-9410-7481-b263-4606fdd10cae",
          "0194881f-9410-7481-b263-4606fdd10caf",
          "0194881f-9410-7481-b263-4606fdd10cb0",
          "0194881f-9410-7481-b263-4606fdd10cb1",
          "0194881f-9410-7481-b263-4606fdd10cb2",
          "0194881f-9410-7481-b263-4606fdd10cb3",
          "0194881f-9410-7481-b263-4606fdd10cb4",
          "0194881f-9410-7481-b263-4606fdd10cb5",
          "0194881f-9410-7481-b263-4606fdd10caa",
          "0194881f-9410-7481-b263-4606fdd10cab",
          "0194881f-9410-7481-b263-4606fdd10cac",
          "0194881f-9410-7481-b263-4606fdd10cbb",
          "0194881f-9410-7481-b263-4606fdd10cba",
          "0194881f-9410-7481-b263-4606fdd10cbc",
          "0194881f-9421-766c-9dc6-41fe6c9a1e03",
          "0194881f-9421-766c-9dc6-41fe6c9a1e05",
          "0194881f-9410-7481-b263-4606fdd10cbd",
          "0194881f-9410-7481-b263-4606fdd10cb6",
          "0194881f-9410-7481-b263-4606fdd10cb7",
          "0194881f-9410-7481-b263-4606fdd10cb8",
          "0194881f-9410-7481-b263-4606fdd10cb9",
        ],
      },
      {
        id: "984680770",
        navn: "Sats og barnetillegg",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "12",
          tittel: "§ 4-12. Dagpengenes størrelse",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-12",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-9428-74d5-b160-f63a4c61a23b",
          "0194881f-9428-74d5-b160-f63a4c61a23c",
          "0194881f-9428-74d5-b160-f63a4c61a23e",
          "0194881f-9428-74d5-b160-f63a4c61a23f",
          "0194881f-9428-74d5-b160-f63a4c61a241",
          "0194881f-9428-74d5-b160-f63a4c61a23d",
          "0194881f-9428-74d5-b160-f63a4c61a244",
          "0194881f-9428-74d5-b160-f63a4c61a245",
          "0194881f-9428-74d5-b160-f63a4c61a240",
          "0194881f-9428-74d5-b160-f63a4c61a246",
          "0194881f-9428-74d5-b160-f63a4c61a247",
          "0194881f-9428-74d5-b160-f63a4c61a248",
          "0194881f-9428-74d5-b160-f63a4c61a24a",
          "0194881f-9428-74d5-b160-f63a4c61a24b",
          "0194881f-9428-74d5-b160-f63a4c61a242",
          "0194881f-9428-74d5-b160-f63a4c61a243",
          "0194881f-9428-74d5-b160-f63a4c61a24d",
          "0194881f-9428-74d5-b160-f63a4c61a24f",
          "0194881f-9428-74d5-b160-f63a4c61a250",
          "0194881f-9428-74d5-b160-f63a4c61a249",
          "0194881f-9428-74d5-b160-f63a4c61a24e",
          "0194881f-9428-74d5-b160-f63a4c61a24c",
        ],
      },
      {
        id: "46199245",
        navn: "Periode",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "15",
          tittel: "§ 4-15. Antall stønadsuker (stønadsperiode)",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-15",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-943d-77a7-969c-147999f1544a",
          "0194881f-943d-77a7-969c-147999f1544b",
          "0194881f-943d-77a7-969c-147999f1544f",
          "0194881f-943d-77a7-969c-147999f15450",
          "0194881f-943d-77a7-969c-147999f1544c",
          "0194881f-943d-77a7-969c-147999f1544d",
          "0194881f-943d-77a7-969c-147999f15451",
          "0194881f-943d-77a7-969c-147999f15454",
          "0194881f-943d-77a7-969c-147999f15455",
          "0194881f-943d-77a7-969c-147999f15452",
          "0194881f-943d-77a7-969c-147999f15453",
          "0194881f-943d-77a7-969c-147999f15456",
          "0194881f-943d-77a7-969c-147999f15459",
          "0194881f-943d-77a7-969c-147999f15449",
          "0194881f-943d-77a7-969c-147999f15457",
        ],
      },
      {
        id: "-2120647254",
        navn: "Dagpenger ved verneplikt",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "19",
          tittel: "§ 4-19. Dagpenger etter avtjent verneplikt",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-19",
        },
        relevantForResultat: false,
        type: "Fastsettelse",
        opplysninger: [],
      },
      {
        id: "-1762604738",
        navn: "Samordning utenfor folketrygden",
        hjemmel: {
          kilde: {
            navn: "Folketrygdloven",
            kortnavn: "ftrl",
          },
          kapittel: "4",
          paragraf: "26",
          tittel: "§ 4-26. Samordning med ytelser utenfor folketrygden",
          url: "https://lovdata.no/nav/lov/1997-02-28-19/§4-26",
        },
        relevantForResultat: true,
        type: "Fastsettelse",
        opplysninger: [
          "0194881f-942e-7cb0-aa59-05ea449d88e0",
          "0194881f-942e-7cb0-aa59-05ea449d88e1",
          "0194881f-942e-7cb0-aa59-05ea449d88e2",
          "0194881f-942e-7cb0-aa59-05ea449d88e3",
          "0194881f-942e-7cb0-aa59-05ea449d88e4",
          "0194881f-942e-7cb0-aa59-05ea449d88e5",
          "0194881f-942e-7cb0-aa59-05ea449d88e6",
          "0194881f-942e-7cb0-aa59-05ea449d88e7",
          "0194881f-942e-7cb0-aa59-05ea449d88e8",
          "0194881f-942f-7bde-ab16-68ffd19e9a26",
          "0194881f-942f-7bde-ab16-68ffd19e9a27",
          "0194881f-942f-7bde-ab16-68ffd19e9a28",
          "0194881f-942f-7bde-ab16-68ffd19e9a29",
          "0194881f-942f-7bde-ab16-68ffd19e9a2e",
          "0194881f-942f-7bde-ab16-68ffd19e9a2b",
          "0194881f-942f-7bde-ab16-68ffd19e9a2c",
          "0194881f-942f-7bde-ab16-68ffd19e9a2f",
          "0194881f-942f-7bde-ab16-68ffd19e9a30",
          "0194881f-942f-7bde-ab16-68ffd19e9a31",
          "0194881f-942f-7bde-ab16-68ffd19e9a32",
          "0194881f-942f-7bde-ab16-68ffd19e9a33",
          "0194881f-942f-7bde-ab16-68ffd19e9a2d",
        ],
      },
    ],
    opplysninger: [
      {
        opplysningTypeId: "0194881f-9462-78af-8977-46092bb030eb",
        navn: "fagsakId",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91cf-f8b2-7418-8ce2-25e3ee92396b",
            opprettet: "2025-11-17T13:35:17.298852",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 15606475,
              datatype: "heltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:35:17.298843",
              meldingId: "cddfb915-10b0-47a6-9d32-c62497adf722",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01958ef2-e237-77c4-89e1-de91256e2e4a",
        navn: "hendelseType",
        datatype: "tekst",
        perioder: [
          {
            id: "019a91d7-550c-706a-b76d-d0c5916211fd",
            opprettet: "2025-11-17T13:43:19.692213",
            status: OPPRINNELSE.NY,
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-11-17",
            gyldigTilOgMed: "2025-11-17",
            verdi: {
              verdi: "BeregnMeldekortHendelse",
              datatype: "tekst",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.692208",
              meldingId: "4f822294-f144-4c9d-a400-b43a300ad7e3",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940b-76ff-acf5-ba7bcb367234",
        navn: "Aldersgrense",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91cf-f8b4-7c9c-bfc9-d7d0290d0766",
            opprettet: "2025-11-17T13:35:17.300498",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 67,
              enhet: "år",
              datatype: "heltall",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940b-76ff-acf5-ba7bcb367233",
        navn: "Fødselsdato",
        datatype: "dato",
        perioder: [
          {
            id: "019a91cf-f9a2-76c2-8c97-3659ed1b211e",
            opprettet: "2025-11-17T13:35:17.53899",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: "2005-07-15",
              datatype: "dato",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:35:17.507059",
              meldingId: "762f096c-bfb5-4195-848a-7eab6f6b83ef",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-940b-76ff-acf5-ba7bcb367235",
        navn: "Dato søker når maks alder",
        datatype: "dato",
        perioder: [
          {
            id: "019a91cf-f9a3-7a85-91ee-ce8d9f47334d",
            opprettet: "2025-11-17T13:35:17.539583",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: "2072-07-15",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "LeggTilÅr",
              },
              opplysninger: [
                "019a91cf-f8b4-7c9c-bfc9-d7d0290d0766",
                "019a91cf-f9a2-76c2-8c97-3659ed1b211e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940b-76ff-acf5-ba7bcb367236",
        navn: "Siste mulige dag bruker kan oppfylle alderskrav",
        datatype: "dato",
        perioder: [
          {
            id: "019a91cf-f9a3-7a85-91ee-ce8d9f473350",
            opprettet: "2025-11-17T13:35:17.539677",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: "2072-07-31",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "SisteDagIMåned",
              },
              opplysninger: ["019a91cf-f9a3-7a85-91ee-ce8d9f47334d"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91d1-7df2-ba1d-4533f37fcc77",
        navn: "søknadId",
        datatype: "tekst",
        perioder: [
          {
            id: "019a91d1-06db-72a3-b556-d561dbe7b475",
            opprettet: "2025-11-17T13:36:26.45979",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "7b2f3bb2-2ee2-4ff1-bf14-82b99ecc4043",
              datatype: "tekst",
            },
            kilde: {
              type: "Saksbehandler",
              registrert: "2025-11-17T13:36:26.415382",
              ident: "Z994794",
              begrunnelse: {
                verdi: "Juni er best, uten protest",
                sistEndret: "2025-11-17T13:36:26.415373",
              },
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: true,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91d1-7df2-ba1d-4533f37fcc73",
        navn: "Søknadsdato",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-0794-7128-b929-cfd52f36171d",
            opprettet: "2025-11-17T13:36:26.644298",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-11-17",
              datatype: "dato",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.614685",
              meldingId: "920e0505-6fb6-4574-84a0-32c1b4b34ca5",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91d1-7df2-ba1d-4533f37fcc74",
        navn: "Ønsker dagpenger fra dato",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-0794-7128-b929-cfd52f36171e",
            opprettet: "2025-11-17T13:36:26.644352",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-11-17",
              datatype: "dato",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.614821",
              meldingId: "920e0505-6fb6-4574-84a0-32c1b4b34ca5",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91d1-7df2-ba1d-4533f37fcc75",
        navn: "Søknadstidspunkt",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-0795-7971-ac54-475abebe99c9",
            opprettet: "2025-11-17T13:36:26.645077",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-11-17",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "SisteAv",
              },
              opplysninger: [
                "019a91d1-0794-7128-b929-cfd52f36171d",
                "019a91d1-0794-7128-b929-cfd52f36171e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194ff86-a035-7eb0-9c60-21899f7cc0c1",
        navn: "Kravet til reell arbeidssøker er relevant",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-0795-7971-ac54-475abebe99d4",
            opprettet: "2025-11-17T13:36:26.645746",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a769",
        navn: "Minimum vanlig arbeidstid",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-0796-766d-8746-ad5db9bf3c22",
            opprettet: "2025-11-17T13:36:26.646265",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 18.75,
              enhet: "timer",
              datatype: "desimaltall",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9441-7d1b-a06a-6727543a141e",
        navn: "Kan jobbe heltid og deltid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fa6",
            opprettet: "2025-11-17T13:36:26.955278",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.924468",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bd9",
        navn: "Kan jobbe i hele Norge",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fa7",
            opprettet: "2025-11-17T13:36:26.955329",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.924702",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bdc",
        navn: "Kan ta alle typer arbeid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fa8",
            opprettet: "2025-11-17T13:36:26.955347",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.924846",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bde",
        navn: "Villig til å bytte yrke",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fa9",
            opprettet: "2025-11-17T13:36:26.955388",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.924965",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a75f",
        navn: "Ønsket arbeidstid",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96faa",
            opprettet: "2025-11-17T13:36:26.955411",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 40,
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.925084",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d85",
        navn: "Har rett til ordinære dagpenger gjennom arbeidsforhold",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fab",
            opprettet: "2025-11-17T13:36:26.955437",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.925216",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d86",
        navn: "Bruker er permittert",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fac",
            opprettet: "2025-11-17T13:36:26.955462",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.925314",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d87",
        navn: "Forskutterte lønnsgarantimidler i form av dagpenger",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fad",
            opprettet: "2025-11-17T13:36:26.95549",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.925425",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d88",
        navn: "Permittert fra fiskeindustrien",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96fae",
            opprettet: "2025-11-17T13:36:26.955515",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.925528",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "01948d3c-4bea-7802-9d18-5342a5e2be99",
        navn: "Avtjent verneplikt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cb-751d-8b36-44b351a96faf",
            opprettet: "2025-11-17T13:36:26.955535",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:26.925627",
              meldingId: "06857c20-0aa8-480d-be9b-91ae2ee45945",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9441-7d1b-a06a-6727543a141f",
        navn: "Det er godkjent at bruker kun søker deltidsarbeid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eead",
            opprettet: "2025-11-17T13:36:26.956632",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Utgangspunkt",
              },
              opplysninger: ["019a91d1-08cb-751d-8b36-44b351a96fa6"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bda",
        navn: "Det er godkjent at bruker kun søker arbeid lokalt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeae",
            opprettet: "2025-11-17T13:36:26.956649",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Utgangspunkt",
              },
              opplysninger: ["019a91d1-08cb-751d-8b36-44b351a96fa7"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194929e-2036-7ac1-ada3-5cbe05a83f08",
        navn: "Har helsemessige begrensninger og kan ikke ta alle typer arbeid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeaf",
            opprettet: "2025-11-17T13:36:26.956664",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Utgangspunkt",
              },
              opplysninger: ["019a91d1-08cb-751d-8b36-44b351a96fa8"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bdf",
        navn: "Oppfyller kravet til å ta ethvert arbeid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeb0",
            opprettet: "2025-11-17T13:36:26.956693",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: ["019a91d1-08cb-751d-8b36-44b351a96fa9"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76d",
        navn: "Villig til å jobbe minimum arbeidstid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeb1",
            opprettet: "2025-11-17T13:36:26.956716",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-0796-766d-8746-ad5db9bf3c22",
                "019a91d1-08cb-751d-8b36-44b351a96faa",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d89",
        navn: "Har rett til ordinære dagpenger uten arbeidsforhold",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeb3",
            opprettet: "2025-11-17T13:36:26.956759",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "IngenAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fab",
                "019a91d1-08cb-751d-8b36-44b351a96fac",
                "019a91d1-08cb-751d-8b36-44b351a96fad",
                "019a91d1-08cb-751d-8b36-44b351a96fae",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01980cf4-9010-7bcf-b578-ca5a825d64ef",
        navn: "Skal kravet til verneplikt vurderes",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeb4",
            opprettet: "2025-11-17T13:36:26.956777",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErSann",
              },
              opplysninger: ["019a91d1-08cb-751d-8b36-44b351a96faf"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01948d43-e218-76f1-b29b-7e604241d98a",
        navn: "Oppfyller kravet til verneplikt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08cc-7880-88aa-d74fc133eeb5",
            opprettet: "2025-11-17T13:36:26.956796",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErSann",
              },
              opplysninger: ["019a91d1-08cb-751d-8b36-44b351a96faf"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bd8",
        navn: "Oppfyller kravet til heltid- og deltidsarbeid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08ce-7347-b501-ddf6da601232",
            opprettet: "2025-11-17T13:36:26.958291",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fa6",
                "019a91d1-08cc-7880-88aa-d74fc133eead",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bdb",
        navn: "Oppfyller kravet til mobilitet",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08ce-7347-b501-ddf6da601233",
            opprettet: "2025-11-17T13:36:26.958323",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fa7",
                "019a91d1-08cc-7880-88aa-d74fc133eeae",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877bdd",
        navn: "Oppfyller kravet til å være arbeidsfør",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08ce-7347-b501-ddf6da601234",
            opprettet: "2025-11-17T13:36:26.958345",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fa8",
                "019a91d1-08cc-7880-88aa-d74fc133eeaf",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d8a",
        navn: "Ordinære dagpenger",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08ce-7347-b501-ddf6da601235",
            opprettet: "2025-11-17T13:36:26.958375",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fab",
                "019a91d1-08cc-7880-88aa-d74fc133eeb3",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877be2",
        navn: "Reell arbeidssøker",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08ce-7347-b501-ddf6da601239",
            opprettet: "2025-11-17T13:36:26.958931",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Alle",
              },
              opplysninger: [
                "019a91d1-08cc-7880-88aa-d74fc133eeb0",
                "019a91d1-08cc-7880-88aa-d74fc133eeb1",
                "019a91d1-08ce-7347-b501-ddf6da601232",
                "019a91d1-08ce-7347-b501-ddf6da601233",
                "019a91d1-08ce-7347-b501-ddf6da601234",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9444-7a73-a458-0af81c034d8b",
        navn: "Rettighetstype",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-08ce-7347-b501-ddf6da60123a",
            opprettet: "2025-11-17T13:36:26.958963",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fac",
                "019a91d1-08cb-751d-8b36-44b351a96fad",
                "019a91d1-08cb-751d-8b36-44b351a96fae",
                "019a91d1-08ce-7347-b501-ddf6da601235",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91d1-7df2-ba1d-4533f37fcc76",
        navn: "Prøvingsdato",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-4397-7fb1-9149-e24517efb646",
            opprettet: "2025-11-17T13:36:42.00794",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-06-02",
              datatype: "dato",
            },
            kilde: {
              type: "Saksbehandler",
              registrert: "2025-11-17T13:36:41.969553",
              ident: "Z994794",
              begrunnelse: {
                verdi: "Best er hest, med mye protest",
                sistEndret: "2025-11-17T13:36:41.969538",
              },
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: true,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940b-76ff-acf5-ba7bcb367237",
        navn: "Oppfyller kravet til alder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-43aa-7a2b-bd2e-aae60a5d6987",
            opprettet: "2025-11-17T13:36:42.026943",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "FørEllerLik",
              },
              opplysninger: [
                "019a91cf-f9a3-7a85-91ee-ce8d9f473350",
                "019a91d1-4397-7fb1-9149-e24517efb646",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9414-7823-8d29-0e25b7feb7ce",
        navn: "Lovpålagt rapporteringsfrist for A-ordningen",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-43ad-7cec-a4c9-4ed4e35357c4",
            opprettet: "2025-11-17T13:36:42.029519",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-06-05",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04246",
        navn: "Maks lengde på opptjeningsperiode",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-43ad-7cec-a4c9-4ed4e35357c5",
            opprettet: "2025-11-17T13:36:42.029585",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 36,
              enhet: "måneder",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04243",
        navn: "Grunnbeløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-43ad-7cec-a4c9-4ed4e35357c6",
            opprettet: "2025-11-17T13:36:42.029742",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 130160,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f0423f",
        navn: "Antall G for krav til 12 mnd arbeidsinntekt",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-43ad-7cec-a4c9-4ed4e35357c7",
            opprettet: "2025-11-17T13:36:42.029802",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1.5,
              enhet: "G",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04240",
        navn: "Antall G for krav til 36 mnd arbeidsinntekt",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-43ad-7cec-a4c9-4ed4e35357c8",
            opprettet: "2025-11-17T13:36:42.029844",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 3,
              enhet: "G",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9414-7823-8d29-0e25b7feb7cf",
        navn: "Arbeidsgivers rapporteringsfrist",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-43ae-79a0-a898-42aafad67132",
            opprettet: "2025-11-17T13:36:42.030792",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-06-05",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "FørsteArbeidsdag",
              },
              opplysninger: ["019a91d1-43ad-7cec-a4c9-4ed4e35357c4"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04248",
        navn: "Inntektskrav for siste 12 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-43ae-79a0-a898-42aafad67133",
            opprettet: "2025-11-17T13:36:42.030902",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 195240,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c6",
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c7",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04249",
        navn: "Inntektskrav for siste 36 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-43ae-79a0-a898-42aafad67134",
            opprettet: "2025-11-17T13:36:42.030953",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 390480,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c6",
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c8",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9414-7823-8d29-0e25b7feb7d0",
        navn: "Siste avsluttende kalendermåned",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-43af-761e-b36f-a545f62adda0",
            opprettet: "2025-11-17T13:36:42.03171",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2025-04-30",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "SisteavsluttendeKalenderMåned",
              },
              opplysninger: [
                "019a91d1-4397-7fb1-9149-e24517efb646",
                "019a91d1-43ae-79a0-a898-42aafad67132",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04247",
        navn: "Første måned av opptjeningsperiode",
        datatype: "dato",
        perioder: [
          {
            id: "019a91d1-43b0-7a8d-bd0d-557f5a76a397",
            opprettet: "2025-11-17T13:36:42.032398",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "2022-05-01",
              datatype: "dato",
            },
            utledetAv: {
              regel: {
                navn: "TrekkFraMåned",
              },
              opplysninger: [
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c5",
                "019a91d1-43af-761e-b36f-a545f62adda0",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877be0",
        navn: "Registrert som arbeidssøker",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-454f-71c1-8981-c645f6adcccc",
            opprettet: "2025-11-17T13:36:42.447749",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:42.41552",
              meldingId: "a2f07f02-e6f9-4eff-8c4d-14eaab8b6f9a",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Register",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04244",
        navn: "Inntektsopplysninger",
        datatype: "inntekt",
        perioder: [
          {
            id: "019a91d1-454f-71c1-8981-c645f6adcccd",
            opprettet: "2025-11-17T13:36:42.447809",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "01KA8X2H820QFNWW9YP7Z5NQPB",
              datatype: "tekst",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:42.415685",
              meldingId: "a2f07f02-e6f9-4eff-8c4d-14eaab8b6f9a",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: [
                "019a91d1-4397-7fb1-9149-e24517efb646",
                "019a91d1-43af-761e-b36f-a545f62adda0",
                "019a91d1-43b0-7a8d-bd0d-557f5a76a397",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Register",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04245",
        navn: "Brutto arbeidsinntekt",
        datatype: "inntekt",
        perioder: [
          {
            id: "019a91d1-4550-7e2c-bc59-cc0043e0b3f7",
            opprettet: "2025-11-17T13:36:42.448757",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "01KA8X2H820QFNWW9YP7Z5NQPB",
              datatype: "tekst",
            },
            utledetAv: {
              regel: {
                navn: "FiltrerRelevanteInntekter",
              },
              opplysninger: ["019a91d1-454f-71c1-8981-c645f6adcccd"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04241",
        navn: "Arbeidsinntekt siste 12 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4551-77c0-bf4d-4f475622e028",
            opprettet: "2025-11-17T13:36:42.449414",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 444440,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-4550-7e2c-bc59-cc0043e0b3f7"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f04242",
        navn: "Arbeidsinntekt siste 36 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4551-77c0-bf4d-4f475622e029",
            opprettet: "2025-11-17T13:36:42.449733",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 444440,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-4550-7e2c-bc59-cc0043e0b3f7"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f0424a",
        navn: "Arbeidsinntekt er over kravet for siste 12 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4552-7bca-a2ef-0f42d356629b",
            opprettet: "2025-11-17T13:36:42.450176",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-43ae-79a0-a898-42aafad67133",
                "019a91d1-4551-77c0-bf4d-4f475622e028",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f0424b",
        navn: "Arbeidsinntekt er over kravet for siste 36 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4552-7bca-a2ef-0f42d356629c",
            opprettet: "2025-11-17T13:36:42.450216",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-43ae-79a0-a898-42aafad67134",
                "019a91d1-4551-77c0-bf4d-4f475622e029",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9413-77ce-92ec-d29700f0424c",
        navn: "Oppfyller kravet til minsteinntekt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4552-7bca-a2ef-0f42d356629e",
            opprettet: "2025-11-17T13:36:42.450618",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-4552-7bca-a2ef-0f42d356629b",
                "019a91d1-4552-7bca-a2ef-0f42d356629c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943f-78d9-b874-00a4944c54f1",
        navn: "Oppfyller vilkåret om å ikke motta andre fulle ytelser",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a1",
            opprettet: "2025-11-17T13:36:42.451076",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d54c",
        navn: "Bruker er medlem av folketrygden",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a2",
            opprettet: "2025-11-17T13:36:42.451102",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d4",
        navn: "Sykepenger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a3",
            opprettet: "2025-11-17T13:36:42.451147",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d5",
        navn: "Pleiepenger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a4",
            opprettet: "2025-11-17T13:36:42.451166",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d6",
        navn: "Omsorgspenger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a5",
            opprettet: "2025-11-17T13:36:42.451187",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d7",
        navn: "Opplæringspenger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a6",
            opprettet: "2025-11-17T13:36:42.451207",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d1",
        navn: "Uføretrygd etter lovens kapittel 12",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a7",
            opprettet: "2025-11-17T13:36:42.451227",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d9",
        navn: "Foreldrepenger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a8",
            opprettet: "2025-11-17T13:36:42.451248",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45da",
        navn: "Svangerskapspenger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2a9",
            opprettet: "2025-11-17T13:36:42.451267",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91df-746a-a8ac-4a6b2b30685d",
        navn: "Brukeren deltar i streik eller er omfattet av lock-out",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2aa",
            opprettet: "2025-11-17T13:36:42.451286",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91df-746a-a8ac-4a6b2b30685e",
        navn: "Brukeren er ledig ved samme bedrift eller arbeidsplass, og blir påvirket av utfallet",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2ab",
            opprettet: "2025-11-17T13:36:42.451306",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76b",
        navn: "Ny arbeidstid per uke",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2ac",
            opprettet: "2025-11-17T13:36:42.451327",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "019522d6-846d-7173-a892-67f10016d8d2",
        navn: "Ordinært krav til prosentvis tap av arbeidstid",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2ad",
            opprettet: "2025-11-17T13:36:42.451364",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 50,
              enhet: "prosent",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a764",
        navn: "Beregningsregel: Arbeidstid siste 6 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2ae",
            opprettet: "2025-11-17T13:36:42.451388",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a765",
        navn: "Beregningsregel: Arbeidstid siste 12 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2af",
            opprettet: "2025-11-17T13:36:42.451414",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a766",
        navn: "Beregningsregel: Arbeidstid siste 36 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b0",
            opprettet: "2025-11-17T13:36:42.451436",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0196b4a7-23b5-7b2c-aa95-e4167d900de8",
        navn: "Arbeidstidsreduksjonen er ikke brukt tidligere i en full stønadsperiode",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b1",
            opprettet: "2025-11-17T13:36:42.451458",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b527",
        navn: "Deltar i arbeidsmarkedstiltak",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b2",
            opprettet: "2025-11-17T13:36:42.451479",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b528",
        navn: "Deltar i opplæring for innvandrere",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b3",
            opprettet: "2025-11-17T13:36:42.451501",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b529",
        navn: "Deltar i grunnskoleopplæring, videregående opplæring og opplæring i grunnleggende ferdigheter",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b4",
            opprettet: "2025-11-17T13:36:42.451526",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b52a",
        navn: "Deltar i høyere yrkesfaglig utdanning",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b5",
            opprettet: "2025-11-17T13:36:42.45155",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b52b",
        navn: "Deltar i høyere utdanning",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b6",
            opprettet: "2025-11-17T13:36:42.451574",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b52c",
        navn: "Deltar på kurs mv",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b7",
            opprettet: "2025-11-17T13:36:42.451596",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9447-7e36-a569-3e9f42bff9f6",
        navn: "Bruker er utestengt fra dagpenger",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4553-7109-a755-60e88070d2b8",
            opprettet: "2025-11-17T13:36:42.451622",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d54d",
        navn: "Oppfyller kravet til medlemskap",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3befb",
            opprettet: "2025-11-17T13:36:42.452363",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErSann",
              },
              opplysninger: ["019a91d1-4553-7109-a755-60e88070d2a2"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0196afaf-afbd-7079-b2cf-3669ad9d86aa",
        navn: "Uføretrygden er gitt med virkningstidspunkt i inneværende år eller innenfor de to siste kalenderår",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3befc",
            opprettet: "2025-11-17T13:36:42.452406",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErSann",
              },
              opplysninger: ["019a91d1-4553-7109-a755-60e88070d2a7"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-91df-746a-a8ac-4a6b2b30685f",
        navn: "Brukeren er ikke påvirket av streik eller lock-out",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3befd",
            opprettet: "2025-11-17T13:36:42.452447",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "IngenAv",
              },
              opplysninger: [
                "019a91d1-4553-7109-a755-60e88070d2aa",
                "019a91d1-4553-7109-a755-60e88070d2ab",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a762",
        navn: "Krav til prosentvis tap av arbeidstid",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3befe",
            opprettet: "2025-11-17T13:36:42.45248",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 50,
              enhet: "prosent",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fae",
                "019a91d1-4553-7109-a755-60e88070d2ad",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a763",
        navn: "Beregningsregel: Tapt arbeidstid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3beff",
            opprettet: "2025-11-17T13:36:42.452517",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-4553-7109-a755-60e88070d2ae",
                "019a91d1-4553-7109-a755-60e88070d2af",
                "019a91d1-4553-7109-a755-60e88070d2b0",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b523",
        navn: "Godkjent unntak for utdanning eller opplæring?",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3bf00",
            opprettet: "2025-11-17T13:36:42.452553",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-4553-7109-a755-60e88070d2b2",
                "019a91d1-4553-7109-a755-60e88070d2b3",
                "019a91d1-4553-7109-a755-60e88070d2b4",
                "019a91d1-4553-7109-a755-60e88070d2b5",
                "019a91d1-4553-7109-a755-60e88070d2b6",
                "019a91d1-4553-7109-a755-60e88070d2b7",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9447-7e36-a569-3e9f42bff9f7",
        navn: "Oppfyller krav til ikke utestengt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4554-7b40-83ee-edd9e9f3bf01",
            opprettet: "2025-11-17T13:36:42.452584",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "IngenAv",
              },
              opplysninger: ["019a91d1-4553-7109-a755-60e88070d2b8"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0196afc0-6807-7fa3-83e4-cf7f621f3a7e",
        navn: "Sum hvis Uføre ikke skal samordnes",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4555-7eb7-afef-bcf6b26c80de",
            opprettet: "2025-11-17T13:36:42.453216",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0196afbf-e32d-775a-ad10-f476e26dcb6f",
        navn: "Uførebeløp som skal samordnes",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4555-7eb7-afef-bcf6b26c80e0",
            opprettet: "2025-11-17T13:36:42.453813",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-4554-7b40-83ee-edd9e9f3befc",
                "019a91d1-4555-7eb7-afef-bcf6b26c80de",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86e9",
        navn: "Sum andre ytelser",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-4556-7ec1-b599-1e858dc76ad3",
            opprettet: "2025-11-17T13:36:42.454522",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Addisjon",
              },
              opplysninger: [
                "019a91d1-4553-7109-a755-60e88070d2a3",
                "019a91d1-4553-7109-a755-60e88070d2a4",
                "019a91d1-4553-7109-a755-60e88070d2a5",
                "019a91d1-4553-7109-a755-60e88070d2a6",
                "019a91d1-4553-7109-a755-60e88070d2a8",
                "019a91d1-4553-7109-a755-60e88070d2a9",
                "019a91d1-4555-7eb7-afef-bcf6b26c80e0",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0196ab10-0cff-7301-99d6-65be50a50201",
        navn: "Bostedsland er Norge",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fc-715e-868d-0f325c238561",
            opprettet: "2025-11-17T13:36:43.13295",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.097739",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a75e",
        navn: "Har krav på lønn fra arbeidsgiver",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd93",
            opprettet: "2025-11-17T13:36:43.133091",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.097931",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b522",
        navn: "Brukeren er under utdanning eller opplæring",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd94",
            opprettet: "2025-11-17T13:36:43.133225",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098071",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d2",
        navn: "Foreldrepenger etter lovens kapittel 14",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd95",
            opprettet: "2025-11-17T13:36:43.133285",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098223",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45cf",
        navn: "Omsorgspenger etter lovens kapittel 9",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd96",
            opprettet: "2025-11-17T13:36:43.133342",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098337",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45ce",
        navn: "Pleiepenger etter lovens kapittel 9",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd97",
            opprettet: "2025-11-17T13:36:43.133428",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098464",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d3",
        navn: "Svangerskapspenger etter lovens kapittel 14",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd98",
            opprettet: "2025-11-17T13:36:43.133486",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098581",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45d0",
        navn: "Opplæringspenger etter lovens kapittel 9",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd99",
            opprettet: "2025-11-17T13:36:43.133539",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098691",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9433-70e9-a85b-c246150c45cd",
        navn: "Sykepenger etter lovens kapittel 8",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47fd-7f63-985b-57e20872dd9a",
            opprettet: "2025-11-17T13:36:43.133595",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:43.098841",
              meldingId: "656ff708-9cb5-416b-ba46-4d0fa2c91752",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d549",
        navn: "Bruker oppholder seg i Norge",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac724d",
            opprettet: "2025-11-17T13:36:43.135021",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErSann",
              },
              opplysninger: ["019a91d1-47fc-715e-868d-0f325c238561"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Bruker",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86ea",
        navn: "Medlem har reduserte ytelser fra folketrygden (Samordning)",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac724e",
            opprettet: "2025-11-17T13:36:43.135101",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-4554-7b40-83ee-edd9e9f3befc",
                "019a91d1-47fd-7f63-985b-57e20872dd95",
                "019a91d1-47fd-7f63-985b-57e20872dd96",
                "019a91d1-47fd-7f63-985b-57e20872dd97",
                "019a91d1-47fd-7f63-985b-57e20872dd98",
                "019a91d1-47fd-7f63-985b-57e20872dd99",
                "019a91d1-47fd-7f63-985b-57e20872dd9a",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a761",
        navn: "Oppfyller vilkåret til tap av arbeidsinntekt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac724f",
            opprettet: "2025-11-17T13:36:43.13521",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "IngenAv",
              },
              opplysninger: ["019a91d1-47fd-7f63-985b-57e20872dd93"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b524",
        navn: "Har svart ja på spørsmål om utdanning eller opplæring",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac7250",
            opprettet: "2025-11-17T13:36:43.135253",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErSann",
              },
              opplysninger: ["019a91d1-47fd-7f63-985b-57e20872dd94"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b525",
        navn: "Har svart nei på spørsmål om utdanning eller opplæring",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac7251",
            opprettet: "2025-11-17T13:36:43.135292",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErUsann",
              },
              opplysninger: ["019a91d1-47fd-7f63-985b-57e20872dd94"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d54a",
        navn: "Oppfyller unntak for opphold i Norge",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac7253",
            opprettet: "2025-11-17T13:36:43.135904",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Utgangspunkt",
              },
              opplysninger: ["019a91d1-47ff-7ed7-831a-0493e5ac724d"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b526",
        navn: "Oppfyller kravet på unntak for utdanning eller opplæring",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-47ff-7ed7-831a-0493e5ac7254",
            opprettet: "2025-11-17T13:36:43.135997",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Alle",
              },
              opplysninger: [
                "019a91d1-4554-7b40-83ee-edd9e9f3bf00",
                "019a91d1-47ff-7ed7-831a-0493e5ac7250",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d54b",
        navn: "Oppfyller kravet til opphold i Norge eller unntak",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4800-70ad-843d-434d3f18303f",
            opprettet: "2025-11-17T13:36:43.13666",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-47ff-7ed7-831a-0493e5ac724d",
                "019a91d1-47ff-7ed7-831a-0493e5ac7253",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9445-734c-a7ee-045edf29b52d",
        navn: "Oppfyller krav til utdanning eller opplæring",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4800-70ad-843d-434d3f183040",
            opprettet: "2025-11-17T13:36:43.136709",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-47ff-7ed7-831a-0493e5ac7251",
                "019a91d1-47ff-7ed7-831a-0493e5ac7254",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9443-72b4-8b30-5f6cdb24d54e",
        navn: "Kravet til opphold i Norge er oppfylt",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-4801-7dd7-8fcf-f323d2bd82a7",
            opprettet: "2025-11-17T13:36:43.137418",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Alle",
              },
              opplysninger: [
                "019a91d1-4554-7b40-83ee-edd9e9f3befb",
                "019a91d1-4800-70ad-843d-434d3f18303f",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9442-707b-a6ee-e96c06877be1",
        navn: "Oppfyller kravet til å være registrert som arbeidssøker",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8457-77ac-8c1f-26a836ab498b",
            opprettet: "2025-11-17T13:36:58.583155",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "Saksbehandler",
              registrert: "2025-11-17T13:36:58.536417",
              ident: "Z994794",
              begrunnelse: {
                verdi: "Best",
                sistEndret: "2025-11-17T13:36:58.536408",
              },
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: true,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940f-7af9-9387-052e028b29ee",
        navn: "Grunnbeløp for grunnlag",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e924",
            opprettet: "2025-11-17T13:36:58.585019",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 130160,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940f-7af9-9387-052e028b29ed",
        navn: "Tellende inntekt",
        datatype: "inntekt",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e925",
            opprettet: "2025-11-17T13:36:58.58509",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "01KA8X2H820QFNWW9YP7Z5NQPB",
              datatype: "tekst",
            },
            utledetAv: {
              regel: {
                navn: "FiltrerRelevanteInntekter",
              },
              opplysninger: ["019a91d1-454f-71c1-8981-c645f6adcccd"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10ca7",
        navn: "Faktor for maksimalt mulig grunnlag",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e926",
            opprettet: "2025-11-17T13:36:58.585159",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 6,
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10ca9",
        navn: "Antall år i 36 måneder",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e927",
            opprettet: "2025-11-17T13:36:58.585208",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 3,
              enhet: "år",
              datatype: "desimaltall",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a23e",
        navn: "Faktor for utregning av dagsats etter dagpengegrunnlaget",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e928",
            opprettet: "2025-11-17T13:36:58.585263",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0.0024,
              enhet: "G",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a23d",
        navn: "Barnetilleggets størrelse i kroner per dag for hvert barn",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e929",
            opprettet: "2025-11-17T13:36:58.585332",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 37,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a246",
        navn: "90% av grunnlag for dagpenger",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e92a",
            opprettet: "2025-11-17T13:36:58.585384",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0.9,
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a247",
        navn: "Antall arbeidsdager per år",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e92b",
            opprettet: "2025-11-17T13:36:58.585429",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 260,
              enhet: "dager",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a249",
        navn: "Antall arbeidsdager per uke",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e92c",
            opprettet: "2025-11-17T13:36:58.585464",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5,
              enhet: "dager",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a2b",
        navn: "Hvor mange prosent av G skal brukes som terskel ved samordning",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e92d",
            opprettet: "2025-11-17T13:36:58.585495",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0.03,
              enhet: "prosent",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e7",
        navn: "Pensjon fra en offentlig tjenestepensjonsordning beløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e92e",
            opprettet: "2025-11-17T13:36:58.585521",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e8",
        navn: "Uførepensjon fra offentlig pensjonsordning beløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e92f",
            opprettet: "2025-11-17T13:36:58.58555",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a26",
        navn: "Vartpenger beløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e930",
            opprettet: "2025-11-17T13:36:58.585576",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a27",
        navn: "Ventelønn beløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e931",
            opprettet: "2025-11-17T13:36:58.585603",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a28",
        navn: "Etterlønn beløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e932",
            opprettet: "2025-11-17T13:36:58.585628",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a29",
        navn: "Garantilott fra Garantikassen for fiskere beløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e933",
            opprettet: "2025-11-17T13:36:58.585654",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f1544f",
        navn: "Terskelfaktor for 12 måneder",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e934",
            opprettet: "2025-11-17T13:36:58.585687",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 2,
              enhet: "G",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15450",
        navn: "Terskelfaktor for 36 måneder",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e935",
            opprettet: "2025-11-17T13:36:58.585717",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 2,
              enhet: "G",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15449",
        navn: "Antall dager som skal regnes med i hver uke",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e936",
            opprettet: "2025-11-17T13:36:58.585751",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5,
              enhet: "dager",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943f-78d9-b874-00a4944c54f0",
        navn: "Antall dagsats for egenandel",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e937",
            opprettet: "2025-11-17T13:36:58.585783",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 3,
              enhet: "dager",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e1",
        navn: "Mottar pensjon fra en offentlig tjenestepensjonsordning",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e938",
            opprettet: "2025-11-17T13:36:58.585812",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e2",
        navn: "Mottar redusert uførepensjon fra offentlig pensjonsordning",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e939",
            opprettet: "2025-11-17T13:36:58.58584",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e3",
        navn: "Mottar vartpenger",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e93a",
            opprettet: "2025-11-17T13:36:58.585869",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e4",
        navn: "Mottar ventelønn",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e93b",
            opprettet: "2025-11-17T13:36:58.585905",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e5",
        navn: "Mottar etterlønn",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e93c",
            opprettet: "2025-11-17T13:36:58.585934",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e6",
        navn: "Mottar garantilott fra Garantikassen for fiskere.",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8459-7340-a5f4-081030f0e93d",
            opprettet: "2025-11-17T13:36:58.585965",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a768",
        navn: "Maksimal vanlig arbeidstid",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-845a-70b4-87de-f431a6382764",
            opprettet: "2025-11-17T13:36:58.586011",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 40,
              enhet: "timer",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a767",
        navn: "Beregnet vanlig arbeidstid per uke før tap",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-845a-70b4-87de-f431a6382765",
            opprettet: "2025-11-17T13:36:58.586044",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 37.5,
              enhet: "timer",
              datatype: "desimaltall",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86ed",
        navn: "Antall timer arbeidstiden skal samordnes mot",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-845a-70b4-87de-f431a6382766",
            opprettet: "2025-11-17T13:36:58.586073",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
          },
        ],
        synlig: false,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-940f-7af9-9387-052e028b29ec",
        navn: "Oppjustert inntekt",
        datatype: "inntekt",
        perioder: [
          {
            id: "019a91d1-845b-7f95-addf-24bb71bea5db",
            opprettet: "2025-11-17T13:36:58.587471",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "01KA8X2H820QFNWW9YP7Z5NQPB",
              datatype: "tekst",
            },
            utledetAv: {
              regel: {
                navn: "Oppjuster",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e924",
                "019a91d1-8459-7340-a5f4-081030f0e925",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10ca8",
        navn: "6 ganger grunnbeløp",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845b-7f95-addf-24bb71bea5dc",
            opprettet: "2025-11-17T13:36:58.587552",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 780960,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e924",
                "019a91d1-8459-7340-a5f4-081030f0e926",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cad",
        navn: "Utbetalt inntekt periode 1",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845b-7f95-addf-24bb71bea5dd",
            opprettet: "2025-11-17T13:36:58.587699",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 444440,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-8459-7340-a5f4-081030f0e925"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cae",
        navn: "Utbetalt inntekt periode 2",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845b-7f95-addf-24bb71bea5de",
            opprettet: "2025-11-17T13:36:58.5878",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-8459-7340-a5f4-081030f0e925"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10caf",
        navn: "Utbetalt inntekt periode 3",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845b-7f95-addf-24bb71bea5df",
            opprettet: "2025-11-17T13:36:58.587898",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-8459-7340-a5f4-081030f0e925"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a2c",
        navn: "Beløp tilsvarende nedre terskel av G",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845b-7f95-addf-24bb71bea5e0",
            opprettet: "2025-11-17T13:36:58.587949",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 3904.8,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e924",
                "019a91d1-8459-7340-a5f4-081030f0e92d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a2e",
        navn: "Sum av ytelser utenfor folketrygden",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845c-7a35-985c-68b60d310651",
            opprettet: "2025-11-17T13:36:58.588026",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SumAv",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92e",
                "019a91d1-8459-7340-a5f4-081030f0e92f",
                "019a91d1-8459-7340-a5f4-081030f0e930",
                "019a91d1-8459-7340-a5f4-081030f0e931",
                "019a91d1-8459-7340-a5f4-081030f0e932",
                "019a91d1-8459-7340-a5f4-081030f0e933",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f1544c",
        navn: "Terskel for 12 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845c-7a35-985c-68b60d310652",
            opprettet: "2025-11-17T13:36:58.588095",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 260320,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c6",
                "019a91d1-8459-7340-a5f4-081030f0e934",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15451",
        navn: "Snittinntekt siste 36 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845c-7a35-985c-68b60d310653",
            opprettet: "2025-11-17T13:36:58.588228",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 148146.66666666666,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Divisjon",
              },
              opplysninger: [
                "019a91d1-4551-77c0-bf4d-4f475622e029",
                "019a91d1-8459-7340-a5f4-081030f0e927",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f1544d",
        navn: "Terskel for 36 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845c-7a35-985c-68b60d310654",
            opprettet: "2025-11-17T13:36:58.588278",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 260320,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-43ad-7cec-a4c9-4ed4e35357c6",
                "019a91d1-8459-7340-a5f4-081030f0e935",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86ee",
        navn: "Samordnet fastsatt arbeidstid",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-845c-7a35-985c-68b60d310655",
            opprettet: "2025-11-17T13:36:58.588339",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: 37.5,
              enhet: "timer",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "Substraksjon",
              },
              opplysninger: [
                "019a91d1-845a-70b4-87de-f431a6382765",
                "019a91d1-845a-70b4-87de-f431a6382766",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb0",
        navn: "Inntektperiode 1",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845d-7dcb-ab61-575cf038223c",
            opprettet: "2025-11-17T13:36:58.589606",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413.3131228432,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-845b-7f95-addf-24bb71bea5db"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb1",
        navn: "Inntektperiode 2",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845d-7dcb-ab61-575cf038223d",
            opprettet: "2025-11-17T13:36:58.589766",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-845b-7f95-addf-24bb71bea5db"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb2",
        navn: "Inntektperiode 3",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845d-7dcb-ab61-575cf038223e",
            opprettet: "2025-11-17T13:36:58.589892",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SummerPeriode",
              },
              opplysninger: ["019a91d1-845b-7f95-addf-24bb71bea5db"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15454",
        navn: "Over terskel for 12 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-845d-7dcb-ab61-575cf038223f",
            opprettet: "2025-11-17T13:36:58.58998",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-4551-77c0-bf4d-4f475622e028",
                "019a91d1-845c-7a35-985c-68b60d310652",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15455",
        navn: "Over terskel for 36 måneder",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-845e-7338-9fe8-3fb9ee40c81e",
            opprettet: "2025-11-17T13:36:58.590054",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-845c-7a35-985c-68b60d310653",
                "019a91d1-845c-7a35-985c-68b60d310654",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10caa",
        navn: "Inntekt etter avkortning og oppjustering siste 12 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5be",
            opprettet: "2025-11-17T13:36:58.591239",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413.3131228432,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb3",
        navn: "Avkortet inntektperiode 1",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5bf",
            opprettet: "2025-11-17T13:36:58.591287",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413.3131228432,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb4",
        navn: "Avkortet inntektperiode 2",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c0",
            opprettet: "2025-11-17T13:36:58.591329",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb5",
        navn: "Avkortet inntektperiode 3",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c1",
            opprettet: "2025-11-17T13:36:58.591368",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb6",
        navn: "Har avkortet grunnlaget i periode 1",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c2",
            opprettet: "2025-11-17T13:36:58.591414",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnn",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb7",
        navn: "Har avkortet grunnlaget i periode 2",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c3",
            opprettet: "2025-11-17T13:36:58.591454",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnn",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb8",
        navn: "Har avkortet grunnlaget i periode 3",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c4",
            opprettet: "2025-11-17T13:36:58.591493",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnn",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5dc",
                "019a91d1-845d-7dcb-ab61-575cf038223e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f1544b",
        navn: "Lang dagpengeperiode",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c5",
            opprettet: "2025-11-17T13:36:58.591544",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 104,
              enhet: "uker",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f1544a",
        navn: "Kort dagpengeperiode",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-845f-77a5-86aa-54bddcf6a5c6",
            opprettet: "2025-11-17T13:36:58.591583",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 52,
              enhet: "uker",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Oppslag",
              },
              opplysninger: ["019a91d1-4397-7fb1-9149-e24517efb646"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cab",
        navn: "Inntekt siste 36 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8460-7c14-82a5-2e40fb3eaa78",
            opprettet: "2025-11-17T13:36:58.592784",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413.3131228432,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "SumAv",
              },
              opplysninger: [
                "019a91d1-845f-77a5-86aa-54bddcf6a5bf",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c0",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c1",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cb9",
        navn: "Har avkortet grunnlag",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8460-7c14-82a5-2e40fb3eaa79",
            opprettet: "2025-11-17T13:36:58.59285",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-845f-77a5-86aa-54bddcf6a5c2",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c3",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c4",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15452",
        navn: "Stønadsuker ved siste 12 måneder",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8460-7c14-82a5-2e40fb3eaa7a",
            opprettet: "2025-11-17T13:36:58.592892",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 104,
              enhet: "uker",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-845d-7dcb-ab61-575cf038223f",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c5",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c6",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15453",
        navn: "Stønadsuker ved siste 36 måneder",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8460-7c14-82a5-2e40fb3eaa7b",
            opprettet: "2025-11-17T13:36:58.592936",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 52,
              enhet: "uker",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-845e-7338-9fe8-3fb9ee40c81e",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c5",
                "019a91d1-845f-77a5-86aa-54bddcf6a5c6",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cac",
        navn: "Gjennomsnittlig inntekt etter avkortning og oppjustering siste 36 måneder",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8462-7c62-9888-051ce31c167d",
            opprettet: "2025-11-17T13:36:58.594163",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 155471.10437428107,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Divisjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e927",
                "019a91d1-8460-7c14-82a5-2e40fb3eaa78",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15456",
        navn: "Antall stønadsuker",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8462-7c62-9888-051ce31c167e",
            opprettet: "2025-11-17T13:36:58.594242",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 104,
              enhet: "uker",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "HøyesteAv",
              },
              opplysninger: [
                "019a91d1-8460-7c14-82a5-2e40fb3eaa7a",
                "019a91d1-8460-7c14-82a5-2e40fb3eaa7b",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cbb",
        navn: "Uavrundet grunnlag",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8463-7167-9431-4fb9f43d8990",
            opprettet: "2025-11-17T13:36:58.595369",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413.3131228432,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "HøyesteAv",
              },
              opplysninger: [
                "019a91d1-845f-77a5-86aa-54bddcf6a5be",
                "019a91d1-8462-7c62-9888-051ce31c167d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15459",
        navn: "Antall stønadsuker (stønadsperiode)",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8463-7167-9431-4fb9f43d8991",
            opprettet: "2025-11-17T13:36:58.595426",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 104,
              enhet: "uker",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-4552-7bca-a2ef-0f42d356629e",
                "019a91d1-8462-7c62-9888-051ce31c167e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943d-77a7-969c-147999f15457",
        navn: "Antall stønadsdager",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8463-7167-9431-4fb9f43d8992",
            opprettet: "2025-11-17T13:36:58.595474",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 520,
              enhet: "dager",
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e936",
                "019a91d1-8462-7c62-9888-051ce31c167e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cbc",
        navn: "Grunnlag ved ordinære dagpenger",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8464-72c9-a49b-a387cf22c28d",
            opprettet: "2025-11-17T13:36:58.596841",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Avrund",
              },
              opplysninger: ["019a91d1-8463-7167-9431-4fb9f43d8990"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cba",
        navn: "Brukt beregningsregel",
        datatype: "tekst",
        perioder: [
          {
            id: "019a91d1-8464-72c9-a49b-a387cf22c28e",
            opprettet: "2025-11-17T13:36:58.596999",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: "Inntekt etter avkortning og oppjustering siste 12 måneder",
              datatype: "tekst",
            },
            utledetAv: {
              regel: {
                navn: "Brukt",
              },
              opplysninger: ["019a91d1-8463-7167-9431-4fb9f43d8990"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9421-766c-9dc6-41fe6c9a1e03",
        navn: "Grunnlag for verneplikt hvis kravet er oppfylt",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8466-78b6-a42e-f8df19cad0a4",
            opprettet: "2025-11-17T13:36:58.598285",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-08cc-7880-88aa-d74fc133eeb4",
                "019a91d1-8464-72c9-a49b-a387cf22c28d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9410-7481-b263-4606fdd10cbd",
        navn: "Dagpengegrunnlag",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8467-776c-9b3c-6548004bd23c",
            opprettet: "2025-11-17T13:36:58.599494",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 466413,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "HøyesteAv",
              },
              opplysninger: [
                "019a91d1-8464-72c9-a49b-a387cf22c28d",
                "019a91d1-8466-78b6-a42e-f8df19cad0a4",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9421-766c-9dc6-41fe6c9a1e05",
        navn: "Grunnlaget for verneplikt er høyere enn dagpengegrunnlaget",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8467-776c-9b3c-6548004bd23d",
            opprettet: "2025-11-17T13:36:58.59955",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnn",
              },
              opplysninger: [
                "019a91d1-8464-72c9-a49b-a387cf22c28d",
                "019a91d1-8466-78b6-a42e-f8df19cad0a4",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a23f",
        navn: "Dagsats uten barnetillegg før samordning",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8468-7229-9e62-641ca4422879",
            opprettet: "2025-11-17T13:36:58.600856",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119.3912,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e928",
                "019a91d1-8467-776c-9b3c-6548004bd23c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a248",
        navn: "Maksimalt mulig grunnlag avgrenset til 90% av dagpengegrunnlaget",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8468-7229-9e62-641ca442287a",
            opprettet: "2025-11-17T13:36:58.600916",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 419771.7,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92a",
                "019a91d1-8467-776c-9b3c-6548004bd23c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76c",
        navn: "Fastsatt vanlig arbeidstid etter ordinær eller verneplikt",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-8468-7229-9e62-641ca442287b",
            opprettet: "2025-11-17T13:36:58.600963",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 37.5,
              enhet: "timer",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-845a-70b4-87de-f431a6382765",
                "019a91d1-8467-776c-9b3c-6548004bd23d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a241",
        navn: "Dagsats uten barnetillegg før samordning",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-846a-78cf-a673-2a6db4001294",
            opprettet: "2025-11-17T13:36:58.602561",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Avrund",
              },
              opplysninger: ["019a91d1-8468-7229-9e62-641ca4422879"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a24a",
        navn: "Maksimal mulig dagsats avgrenset til 90% av dagpengegrunnlaget",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-846a-78cf-a673-2a6db4001295",
            opprettet: "2025-11-17T13:36:58.602702",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1614.5065384615384,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Divisjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92b",
                "019a91d1-8468-7229-9e62-641ca442287a",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76a",
        navn: "Fastsatt arbeidstid per uke før tap",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d1-846a-78cf-a673-2a6db4001296",
            opprettet: "2025-11-17T13:36:58.602763",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 37.5,
              enhet: "timer",
              datatype: "desimaltall",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96faa",
                "019a91d1-845a-70b4-87de-f431a6382764",
                "019a91d1-845c-7a35-985c-68b60d310655",
                "019a91d1-8468-7229-9e62-641ca442287b",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a24b",
        navn: "Avrundet maksimal mulig dagsats avgrenset til 90% av dagpengegrunnlaget",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-846c-7679-9522-e25aa8c55595",
            opprettet: "2025-11-17T13:36:58.604207",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1615,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Avrund",
              },
              opplysninger: ["019a91d1-846a-78cf-a673-2a6db4001295"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76e",
        navn: "Oppfyller vilkåret om tap av arbeidstid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-846c-7679-9522-e25aa8c55596",
            opprettet: "2025-11-17T13:36:58.60428",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "SjekkAvTerskel",
              },
              opplysninger: [
                "019a91d1-4553-7109-a755-60e88070d2ac",
                "019a91d1-4554-7b40-83ee-edd9e9f3befe",
                "019a91d1-846a-78cf-a673-2a6db4001296",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9435-72a8-b1ce-9575cbc2a76f",
        navn: "Oppfyller vilkåret om tap av arbeidsinntekt og arbeidstid",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-846d-7a6a-82e4-f11fd93a102d",
            opprettet: "2025-11-17T13:36:58.605644",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "Alle",
              },
              opplysninger: [
                "019a91d1-4553-7109-a755-60e88070d2b1",
                "019a91d1-4554-7b40-83ee-edd9e9f3beff",
                "019a91d1-47ff-7ed7-831a-0493e5ac724f",
                "019a91d1-846c-7679-9522-e25aa8c55596",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a23b",
        navn: "Barn",
        datatype: "barn",
        perioder: [
          {
            id: "019a91d1-8527-7a1d-adf4-8ec673a91d67",
            opprettet: "2025-11-17T13:36:58.791555",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              søknadBarnId: "97895844-d6d9-403c-bab7-fbb426d5a459",
              verdi: [],
              datatype: "barn",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:58.756486",
              meldingId: "129f87df-7a5f-4942-9efc-80e72b035157",
            },
            utledetAv: {
              regel: {
                navn: "innhentMed",
              },
              opplysninger: ["019a91d1-06db-72a3-b556-d561dbe7b475"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Register",
      },
      {
        opplysningTypeId: "0194881f-942e-7cb0-aa59-05ea449d88e0",
        navn: "Oppgitt andre ytelser utenfor NAV i søknaden",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8527-7a1d-adf4-8ec673a91d68",
            opprettet: "2025-11-17T13:36:58.791656",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:36:58.756723",
              meldingId: "129f87df-7a5f-4942-9efc-80e72b035157",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a23c",
        navn: "Antall barn som gir rett til barnetillegg",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d1-8529-7bbd-a49b-94f0ab7e3b86",
            opprettet: "2025-11-17T13:36:58.793493",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "heltall",
            },
            utledetAv: {
              regel: {
                navn: "AntallAv",
              },
              opplysninger: ["019a91d1-8527-7a1d-adf4-8ec673a91d67"],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a2d",
        navn: "Skal samordnes med ytelser utenfor folketrygden",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8529-7bbd-a49b-94f0ab7e3b87",
            opprettet: "2025-11-17T13:36:58.793591",
            status: "Arvet",
            opprinnelse: "Arvet",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e938",
                "019a91d1-8459-7340-a5f4-081030f0e939",
                "019a91d1-8459-7340-a5f4-081030f0e93a",
                "019a91d1-8459-7340-a5f4-081030f0e93b",
                "019a91d1-8459-7340-a5f4-081030f0e93c",
                "019a91d1-8459-7340-a5f4-081030f0e93d",
                "019a91d1-8527-7a1d-adf4-8ec673a91d68",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a244",
        navn: "Sum av barnetillegg",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-852a-7347-a951-5f01df0d29bb",
            opprettet: "2025-11-17T13:36:58.79491",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e929",
                "019a91d1-8529-7bbd-a49b-94f0ab7e3b86",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a245",
        navn: "Dagsats med barnetillegg før samordning",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-852c-7c14-860c-7e24a294b1d7",
            opprettet: "2025-11-17T13:36:58.7963",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Addisjon",
              },
              opplysninger: [
                "019a91d1-846a-78cf-a673-2a6db4001294",
                "019a91d1-852a-7347-a951-5f01df0d29bb",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a24c",
        navn: "Har barnetillegg",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-852c-7c14-860c-7e24a294b1d8",
            opprettet: "2025-11-17T13:36:58.796401",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e929",
                "019a91d1-852a-7347-a951-5f01df0d29bb",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a242",
        navn: "Andel av dagsats med barnetillegg som overstiger maks andel av dagpengegrunnlaget",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-852e-751c-b094-5c14c46c732e",
            opprettet: "2025-11-17T13:36:58.798032",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Substraksjon",
              },
              opplysninger: [
                "019a91d1-846c-7679-9522-e25aa8c55595",
                "019a91d1-852c-7c14-860c-7e24a294b1d7",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a240",
        navn: "Avrundet ukessats med barnetillegg før samordning",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-852e-751c-b094-5c14c46c732f",
            opprettet: "2025-11-17T13:36:58.79822",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5595,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92c",
                "019a91d1-852c-7c14-860c-7e24a294b1d7",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Legacy",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a243",
        navn: "Andel av dagsats uten barnetillegg avkortet til maks andel av dagpengegrunnlaget",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8530-7828-bbb4-21572d756a9d",
            opprettet: "2025-11-17T13:36:58.800041",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Substraksjon",
              },
              opplysninger: [
                "019a91d1-846a-78cf-a673-2a6db4001294",
                "019a91d1-852e-751c-b094-5c14c46c732e",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86eb",
        navn: "Samordnet dagsats uten barnetillegg",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8531-72b0-b869-4c0104578215",
            opprettet: "2025-11-17T13:36:58.801897",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Substraksjon",
              },
              opplysninger: [
                "019a91d1-4556-7ec1-b599-1e858dc76ad3",
                "019a91d1-8530-7828-bbb4-21572d756a9d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86ec",
        navn: "Samordnet dagsats er større enn 0",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8532-7a1c-973e-d0af9cfb0acc",
            opprettet: "2025-11-17T13:36:58.802002",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "StørreEnnEllerLik",
              },
              opplysninger: [
                "019a91d1-4556-7ec1-b599-1e858dc76ad3",
                "019a91d1-8530-7828-bbb4-21572d756a9d",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a2f",
        navn: "Samordnet ukessats uten barnetillegg",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8534-7d52-a32b-30e8150fc288",
            opprettet: "2025-11-17T13:36:58.804093",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5595,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92c",
                "019a91d1-8531-72b0-b869-4c0104578215",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9434-79e8-a64d-1a23cc5d86ef",
        navn: "Utfall etter samordning",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-8534-7d52-a32b-30e8150fc289",
            opprettet: "2025-11-17T13:36:58.804232",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "EnAv",
              },
              opplysninger: [
                "019a91d1-852c-7c14-860c-7e24a294b1d8",
                "019a91d1-8532-7a1c-973e-d0af9cfb0acc",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a30",
        navn: "Minste mulige ukessats som som kan brukes",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8535-726a-befb-794742d43e1e",
            opprettet: "2025-11-17T13:36:58.805949",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 3904.8,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-845b-7f95-addf-24bb71bea5e0",
                "019a91d1-8534-7d52-a32b-30e8150fc288",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a31",
        navn: "Ukessats trukket ned for ytelser utenfor folketrygden",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8536-7493-b8a9-4b57db81a4fb",
            opprettet: "2025-11-17T13:36:58.806173",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5595,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Substraksjon",
              },
              opplysninger: [
                "019a91d1-845c-7a35-985c-68b60d310651",
                "019a91d1-8534-7d52-a32b-30e8150fc288",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a32",
        navn: "Samordnet ukessats med ytelser utenfor folketrygden",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8537-7c8b-8dca-bb95ed75d2ad",
            opprettet: "2025-11-17T13:36:58.807872",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5595,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "HøyesteAv",
              },
              opplysninger: [
                "019a91d1-8535-726a-befb-794742d43e1e",
                "019a91d1-8536-7493-b8a9-4b57db81a4fb",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-942f-7bde-ab16-68ffd19e9a33",
        navn: "Dagsats uten barnetillegg samordnet",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8539-7ad2-9a70-1b7afbbd0cb5",
            opprettet: "2025-11-17T13:36:58.809812",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Divisjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92c",
                "019a91d1-8537-7c8b-8dca-bb95ed75d2ad",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a24d",
        navn: "Samordnet dagsats med barnetillegg",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-853b-7c70-930a-f53dd9b150e5",
            opprettet: "2025-11-17T13:36:58.811602",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Addisjon",
              },
              opplysninger: [
                "019a91d1-852a-7347-a951-5f01df0d29bb",
                "019a91d1-8539-7ad2-9a70-1b7afbbd0cb5",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a250",
        navn: "Har samordnet",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-853b-7c70-930a-f53dd9b150e6",
            opprettet: "2025-11-17T13:36:58.811701",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
            utledetAv: {
              regel: {
                navn: "ErUlik",
              },
              opplysninger: [
                "019a91d1-8530-7828-bbb4-21572d756a9d",
                "019a91d1-8539-7ad2-9a70-1b7afbbd0cb5",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a24f",
        navn: "Dagsats med barnetillegg etter samordning og 90 % regel",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-853d-7078-87f2-35e4efd9440c",
            opprettet: "2025-11-17T13:36:58.813436",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "MinstAv",
              },
              opplysninger: [
                "019a91d1-846c-7679-9522-e25aa8c55595",
                "019a91d1-853b-7c70-930a-f53dd9b150e5",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-9428-74d5-b160-f63a4c61a24e",
        navn: "Ukessats med barnetillegg etter samordning",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-853f-7847-bb19-e6ee31e44b13",
            opprettet: "2025-11-17T13:36:58.815571",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 5595,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e92c",
                "019a91d1-853d-7078-87f2-35e4efd9440c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Legacy",
      },
      {
        opplysningTypeId: "019523aa-7941-7dd2-8c43-0644d7b43f57",
        navn: "Tre ganger dagsats",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-853f-7847-bb19-e6ee31e44b14",
            opprettet: "2025-11-17T13:36:58.815706",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 3357,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "Multiplikasjon",
              },
              opplysninger: [
                "019a91d1-8459-7340-a5f4-081030f0e937",
                "019a91d1-853d-7078-87f2-35e4efd9440c",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "0194881f-943f-78d9-b874-00a4944c54ef",
        navn: "Egenandel",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d1-8541-7767-9192-fa8d44e546bc",
            opprettet: "2025-11-17T13:36:58.817649",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: 3357,
              datatype: "penger",
            },
            utledetAv: {
              regel: {
                navn: "HvisSannMedResultat",
              },
              opplysninger: [
                "019a91d1-08cb-751d-8b36-44b351a96fae",
                "019a91d1-853f-7847-bb19-e6ee31e44b14",
              ],
              versjon:
                "europe-north1-docker.pkg.dev/nais-management-233d/teamdagpenger/dp-behandling:2025.11.17-09.58-af5defd",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01990a09-0eab-7957-b88f-14484a50e194",
        navn: "Har løpende rett på dagpenger",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d1-a422-7269-9de8-f69d155dc004",
            opprettet: "2025-11-17T13:37:06.722273",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: true,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01956abd-2871-7517-a332-b462c0c31292",
        navn: "Meldeperiode",
        datatype: "periode",
        perioder: [
          {
            id: "019a91d2-c0bf-7055-b742-f9927395c6e1",
            opprettet: "2025-11-17T13:38:19.583269",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              fom: "2025-06-02",
              tom: "2025-06-15",
              datatype: "periode",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee64",
            opprettet: "2025-11-17T13:42:19.632184",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              fom: "2025-06-16",
              tom: "2025-06-29",
              datatype: "periode",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c5916211fe",
            opprettet: "2025-11-17T13:43:19.692222",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              fom: "2025-06-30",
              tom: "2025-07-13",
              datatype: "periode",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
        ],
        synlig: false,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01948ea0-36e8-72cc-aa4f-16bc446ed3bd",
        navn: "Arbeidsdag",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3c8",
            opprettet: "2025-11-17T13:38:19.591264",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3cb",
            opprettet: "2025-11-17T13:38:19.591295",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ce",
            opprettet: "2025-11-17T13:38:19.591298",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d1",
            opprettet: "2025-11-17T13:38:19.5913",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d4",
            opprettet: "2025-11-17T13:38:19.591303",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d7",
            opprettet: "2025-11-17T13:38:19.591305",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3da",
            opprettet: "2025-11-17T13:38:19.591307",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3dd",
            opprettet: "2025-11-17T13:38:19.591309",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e0",
            opprettet: "2025-11-17T13:38:19.591311",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e3",
            opprettet: "2025-11-17T13:38:19.591313",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e6",
            opprettet: "2025-11-17T13:38:19.591315",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e9",
            opprettet: "2025-11-17T13:38:19.591317",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ec",
            opprettet: "2025-11-17T13:38:19.591319",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ef",
            opprettet: "2025-11-17T13:38:19.591321",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee69",
            opprettet: "2025-11-17T13:42:19.632321",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee6c",
            opprettet: "2025-11-17T13:42:19.632326",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee6f",
            opprettet: "2025-11-17T13:42:19.632329",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee72",
            opprettet: "2025-11-17T13:42:19.632332",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee75",
            opprettet: "2025-11-17T13:42:19.632335",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee78",
            opprettet: "2025-11-17T13:42:19.632338",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee7b",
            opprettet: "2025-11-17T13:42:19.632341",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee7e",
            opprettet: "2025-11-17T13:42:19.632344",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee81",
            opprettet: "2025-11-17T13:42:19.632347",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee84",
            opprettet: "2025-11-17T13:42:19.632398",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee87",
            opprettet: "2025-11-17T13:42:19.632404",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee8a",
            opprettet: "2025-11-17T13:42:19.632407",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee8d",
            opprettet: "2025-11-17T13:42:19.632411",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee90",
            opprettet: "2025-11-17T13:42:19.632414",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621203",
            opprettet: "2025-11-17T13:43:19.692343",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621206",
            opprettet: "2025-11-17T13:43:19.692349",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621209",
            opprettet: "2025-11-17T13:43:19.692352",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162120c",
            opprettet: "2025-11-17T13:43:19.692355",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162120f",
            opprettet: "2025-11-17T13:43:19.692358",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621212",
            opprettet: "2025-11-17T13:43:19.692361",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621215",
            opprettet: "2025-11-17T13:43:19.692363",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621218",
            opprettet: "2025-11-17T13:43:19.692366",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162121b",
            opprettet: "2025-11-17T13:43:19.692369",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162121e",
            opprettet: "2025-11-17T13:43:19.692371",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621221",
            opprettet: "2025-11-17T13:43:19.692373",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621224",
            opprettet: "2025-11-17T13:43:19.692375",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621227",
            opprettet: "2025-11-17T13:43:19.692378",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162122a",
            opprettet: "2025-11-17T13:43:19.692404",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01948ea0-e25c-7c47-8429-a05045d80eca",
        navn: "Arbeidstimer på en arbeidsdag",
        datatype: "desimaltall",
        perioder: [
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3c9",
            opprettet: "2025-11-17T13:38:19.591285",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3cc",
            opprettet: "2025-11-17T13:38:19.591295",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3cf",
            opprettet: "2025-11-17T13:38:19.591298",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d2",
            opprettet: "2025-11-17T13:38:19.5913",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d5",
            opprettet: "2025-11-17T13:38:19.591303",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d8",
            opprettet: "2025-11-17T13:38:19.591305",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3db",
            opprettet: "2025-11-17T13:38:19.591307",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3de",
            opprettet: "2025-11-17T13:38:19.591309",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e1",
            opprettet: "2025-11-17T13:38:19.591311",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e4",
            opprettet: "2025-11-17T13:38:19.591313",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e7",
            opprettet: "2025-11-17T13:38:19.591315",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ea",
            opprettet: "2025-11-17T13:38:19.591317",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ed",
            opprettet: "2025-11-17T13:38:19.591319",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3f0",
            opprettet: "2025-11-17T13:38:19.591321",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee6a",
            opprettet: "2025-11-17T13:42:19.632322",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee6d",
            opprettet: "2025-11-17T13:42:19.632326",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee70",
            opprettet: "2025-11-17T13:42:19.632329",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee73",
            opprettet: "2025-11-17T13:42:19.632332",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee76",
            opprettet: "2025-11-17T13:42:19.632335",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee79",
            opprettet: "2025-11-17T13:42:19.632338",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee7c",
            opprettet: "2025-11-17T13:42:19.632341",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee7f",
            opprettet: "2025-11-17T13:42:19.632344",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee82",
            opprettet: "2025-11-17T13:42:19.632348",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee85",
            opprettet: "2025-11-17T13:42:19.6324",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee88",
            opprettet: "2025-11-17T13:42:19.632404",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee8b",
            opprettet: "2025-11-17T13:42:19.632408",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee8e",
            opprettet: "2025-11-17T13:42:19.632411",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee91",
            opprettet: "2025-11-17T13:42:19.632414",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621204",
            opprettet: "2025-11-17T13:43:19.692345",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621207",
            opprettet: "2025-11-17T13:43:19.692349",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162120a",
            opprettet: "2025-11-17T13:43:19.692353",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162120d",
            opprettet: "2025-11-17T13:43:19.692356",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621210",
            opprettet: "2025-11-17T13:43:19.692358",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621213",
            opprettet: "2025-11-17T13:43:19.692361",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621216",
            opprettet: "2025-11-17T13:43:19.692364",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621219",
            opprettet: "2025-11-17T13:43:19.692367",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162121c",
            opprettet: "2025-11-17T13:43:19.692369",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162121f",
            opprettet: "2025-11-17T13:43:19.692371",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621222",
            opprettet: "2025-11-17T13:43:19.692374",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621225",
            opprettet: "2025-11-17T13:43:19.692376",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621228",
            opprettet: "2025-11-17T13:43:19.692378",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162122b",
            opprettet: "2025-11-17T13:43:19.692405",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: 0,
              enhet: "timer",
              datatype: "desimaltall",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01956ab8-126c-7636-803e-a5d87eda2015",
        navn: "Har meldt seg via meldekort",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ca",
            opprettet: "2025-11-17T13:38:19.591289",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3cd",
            opprettet: "2025-11-17T13:38:19.591296",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d0",
            opprettet: "2025-11-17T13:38:19.591299",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d3",
            opprettet: "2025-11-17T13:38:19.591301",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d6",
            opprettet: "2025-11-17T13:38:19.591303",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3d9",
            opprettet: "2025-11-17T13:38:19.591305",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3dc",
            opprettet: "2025-11-17T13:38:19.591307",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3df",
            opprettet: "2025-11-17T13:38:19.591309",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e2",
            opprettet: "2025-11-17T13:38:19.591311",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e5",
            opprettet: "2025-11-17T13:38:19.591313",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3e8",
            opprettet: "2025-11-17T13:38:19.591315",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3eb",
            opprettet: "2025-11-17T13:38:19.591318",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3ee",
            opprettet: "2025-11-17T13:38:19.59132",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d2-c0c7-73af-b0b9-e5c37508d3f1",
            opprettet: "2025-11-17T13:38:19.591322",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:38:19.582084",
              meldingId: "f04c6e75-d7ab-4b0c-a057-93aa5612fd59",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee6b",
            opprettet: "2025-11-17T13:42:19.632324",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee6e",
            opprettet: "2025-11-17T13:42:19.632327",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee71",
            opprettet: "2025-11-17T13:42:19.63233",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee74",
            opprettet: "2025-11-17T13:42:19.632333",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee77",
            opprettet: "2025-11-17T13:42:19.632336",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee7a",
            opprettet: "2025-11-17T13:42:19.632339",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee7d",
            opprettet: "2025-11-17T13:42:19.632342",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee80",
            opprettet: "2025-11-17T13:42:19.632345",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee83",
            opprettet: "2025-11-17T13:42:19.632348",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee86",
            opprettet: "2025-11-17T13:42:19.6324",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee89",
            opprettet: "2025-11-17T13:42:19.632405",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee8c",
            opprettet: "2025-11-17T13:42:19.632409",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee8f",
            opprettet: "2025-11-17T13:42:19.632412",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d6-6a70-7262-b7d5-0d36c3a8ee92",
            opprettet: "2025-11-17T13:42:19.632414",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:42:19.632034",
              meldingId: "98c3f5d9-e780-4430-b6f5-6258550b8508",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621205",
            opprettet: "2025-11-17T13:43:19.692346",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621208",
            opprettet: "2025-11-17T13:43:19.69235",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162120b",
            opprettet: "2025-11-17T13:43:19.692354",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162120e",
            opprettet: "2025-11-17T13:43:19.692356",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621211",
            opprettet: "2025-11-17T13:43:19.692359",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621214",
            opprettet: "2025-11-17T13:43:19.692362",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621217",
            opprettet: "2025-11-17T13:43:19.692364",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162121a",
            opprettet: "2025-11-17T13:43:19.692368",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162121d",
            opprettet: "2025-11-17T13:43:19.69237",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621220",
            opprettet: "2025-11-17T13:43:19.692372",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621223",
            opprettet: "2025-11-17T13:43:19.692374",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621226",
            opprettet: "2025-11-17T13:43:19.692376",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c591621229",
            opprettet: "2025-11-17T13:43:19.692379",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
          {
            id: "019a91d7-550c-706a-b76d-d0c59162122c",
            opprettet: "2025-11-17T13:43:19.692405",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
            kilde: {
              type: "System",
              registrert: "2025-11-17T13:43:19.69208",
              meldingId: "2e28c72a-4bee-46c9-a226-d0ae0bbcd2b3",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01973a27-d8b3-7ffd-a81a-a3826963b079",
        navn: "Forbrukt egenandel",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d2-c0fc-7a74-ba2d-4d0e5d3ea2b9",
            opprettet: "2025-11-17T13:38:19.644075",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: 3357,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7a-712e-ad47-9e7a862099c6",
            opprettet: "2025-11-17T13:42:19.642172",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5514-7dd6-9c14-969e1b6cceed",
            opprettet: "2025-11-17T13:43:19.700732",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01994cfd-9a27-762e-81fa-61f550467c95",
        navn: "Penger som skal utbetales for perioden",
        datatype: "penger",
        perioder: pengerSomSkalUtbetales,
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01997b70-a12c-7622-bff8-82a20687e640",
        navn: "Gjenstående egenandel",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d2-c0fc-7a74-ba2d-4d0e5d3ea2bb",
            opprettet: "2025-11-17T13:38:19.644498",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7a-712e-ad47-9e7a862099c8",
            opprettet: "2025-11-17T13:42:19.642398",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b15",
            opprettet: "2025-11-17T13:43:19.701098",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01997b70-6e6e-702a-a296-18ae5fb9621d",
        navn: "Oppfyller kravet til tapt arbeidstid i perioden",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d2-c0fc-7a74-ba2d-4d0e5d3ea2bc",
            opprettet: "2025-11-17T13:38:19.644599",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7a-712e-ad47-9e7a862099c9",
            opprettet: "2025-11-17T13:42:19.642477",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b16",
            opprettet: "2025-11-17T13:43:19.701287",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01948ea0-ffdc-7964-ab55-52a7e35e1020",
        navn: "Dag som fører til forbruk av dagpengeperiode",
        datatype: "boolsk",
        perioder: [
          {
            id: "019a91d2-c0fc-7a74-ba2d-4d0e5d3ea2bd",
            opprettet: "2025-11-17T13:38:19.644743",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fc-7a74-ba2d-4d0e5d3ea2bf",
            opprettet: "2025-11-17T13:38:19.644952",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42d8",
            opprettet: "2025-11-17T13:38:19.645233",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42da",
            opprettet: "2025-11-17T13:38:19.645371",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42dc",
            opprettet: "2025-11-17T13:38:19.645498",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42de",
            opprettet: "2025-11-17T13:38:19.645623",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42e0",
            opprettet: "2025-11-17T13:38:19.645785",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42e2",
            opprettet: "2025-11-17T13:38:19.645935",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b3e",
            opprettet: "2025-11-17T13:38:19.646074",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b40",
            opprettet: "2025-11-17T13:38:19.646235",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b42",
            opprettet: "2025-11-17T13:38:19.646437",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b44",
            opprettet: "2025-11-17T13:38:19.646676",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b46",
            opprettet: "2025-11-17T13:38:19.646913",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d2-c0ff-7c93-94d6-c676c2a5f5f0",
            opprettet: "2025-11-17T13:38:19.647213",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7a-712e-ad47-9e7a862099ca",
            opprettet: "2025-11-17T13:42:19.642571",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7a-712e-ad47-9e7a862099cc",
            opprettet: "2025-11-17T13:42:19.642736",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e166965",
            opprettet: "2025-11-17T13:42:19.647329",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e166967",
            opprettet: "2025-11-17T13:42:19.647592",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e166969",
            opprettet: "2025-11-17T13:42:19.64779",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e16696b",
            opprettet: "2025-11-17T13:42:19.647997",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff209",
            opprettet: "2025-11-17T13:42:19.648331",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff20b",
            opprettet: "2025-11-17T13:42:19.648586",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff20d",
            opprettet: "2025-11-17T13:42:19.648755",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff20f",
            opprettet: "2025-11-17T13:42:19.648948",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79ea",
            opprettet: "2025-11-17T13:42:19.649183",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79ec",
            opprettet: "2025-11-17T13:42:19.649363",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79ee",
            opprettet: "2025-11-17T13:42:19.649526",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79f0",
            opprettet: "2025-11-17T13:42:19.649785",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b17",
            opprettet: "2025-11-17T13:43:19.70141",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b19",
            opprettet: "2025-11-17T13:43:19.701617",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b1b",
            opprettet: "2025-11-17T13:43:19.701811",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c76176",
            opprettet: "2025-11-17T13:43:19.702012",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c76178",
            opprettet: "2025-11-17T13:43:19.702257",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c7617a",
            opprettet: "2025-11-17T13:43:19.702464",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c7617c",
            opprettet: "2025-11-17T13:43:19.70272",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c7617e",
            opprettet: "2025-11-17T13:43:19.702934",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c04709",
            opprettet: "2025-11-17T13:43:19.703184",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c0470b",
            opprettet: "2025-11-17T13:43:19.703401",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c0470d",
            opprettet: "2025-11-17T13:43:19.703601",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c0470f",
            opprettet: "2025-11-17T13:43:19.703803",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: true,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5518-76d6-b936-2cdaff72c2c4",
            opprettet: "2025-11-17T13:43:19.704015",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
          {
            id: "019a91d7-5518-76d6-b936-2cdaff72c2c6",
            opprettet: "2025-11-17T13:43:19.704302",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: false,
              datatype: "boolsk",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01957069-d7d5-7f7c-b359-c00686fbf1f7",
        navn: "Penger som skal utbetales",
        datatype: "penger",
        perioder: [
          {
            id: "019a91d2-c0fc-7a74-ba2d-4d0e5d3ea2be",
            opprettet: "2025-11-17T13:38:19.644863",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42d7",
            opprettet: "2025-11-17T13:38:19.645106",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42d9",
            opprettet: "2025-11-17T13:38:19.645307",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42db",
            opprettet: "2025-11-17T13:38:19.645435",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42dd",
            opprettet: "2025-11-17T13:38:19.64556",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42df",
            opprettet: "2025-11-17T13:38:19.645712",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42e1",
            opprettet: "2025-11-17T13:38:19.645869",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fd-713f-bbe7-8f265f8e42e3",
            opprettet: "2025-11-17T13:38:19.645999",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b3f",
            opprettet: "2025-11-17T13:38:19.646169",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b41",
            opprettet: "2025-11-17T13:38:19.646303",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b43",
            opprettet: "2025-11-17T13:38:19.646552",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: 783,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0fe-718c-aac2-b68d9b4c9b45",
            opprettet: "2025-11-17T13:38:19.646792",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: 786,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0ff-7c93-94d6-c676c2a5f5ef",
            opprettet: "2025-11-17T13:38:19.647013",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d2-c0ff-7c93-94d6-c676c2a5f5f1",
            opprettet: "2025-11-17T13:38:19.647335",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7a-712e-ad47-9e7a862099cb",
            opprettet: "2025-11-17T13:42:19.642654",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7e-7e15-8d14-2728c1c6d874",
            opprettet: "2025-11-17T13:42:19.64697",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e166966",
            opprettet: "2025-11-17T13:42:19.647483",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e166968",
            opprettet: "2025-11-17T13:42:19.647689",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a7f-75ad-a765-4b696e16696a",
            opprettet: "2025-11-17T13:42:19.647902",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff208",
            opprettet: "2025-11-17T13:42:19.648194",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff20a",
            opprettet: "2025-11-17T13:42:19.648468",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff20c",
            opprettet: "2025-11-17T13:42:19.648676",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a80-71d3-ab1f-f8df7ecff20e",
            opprettet: "2025-11-17T13:42:19.648834",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79e9",
            opprettet: "2025-11-17T13:42:19.649057",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79eb",
            opprettet: "2025-11-17T13:42:19.64928",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79ed",
            opprettet: "2025-11-17T13:42:19.649442",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79ef",
            opprettet: "2025-11-17T13:42:19.649637",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d6-6a81-7ec1-a5b9-688a865e79f1",
            opprettet: "2025-11-17T13:42:19.649888",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b18",
            opprettet: "2025-11-17T13:43:19.701515",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b1a",
            opprettet: "2025-11-17T13:43:19.701714",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5515-7078-a245-b34ee40f5b1c",
            opprettet: "2025-11-17T13:43:19.701906",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c76177",
            opprettet: "2025-11-17T13:43:19.702137",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c76179",
            opprettet: "2025-11-17T13:43:19.70236",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c7617b",
            opprettet: "2025-11-17T13:43:19.702608",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5516-78ae-927f-3e89e6c7617d",
            opprettet: "2025-11-17T13:43:19.702828",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c04708",
            opprettet: "2025-11-17T13:43:19.703042",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c0470a",
            opprettet: "2025-11-17T13:43:19.703298",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c0470c",
            opprettet: "2025-11-17T13:43:19.7035",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c0470e",
            opprettet: "2025-11-17T13:43:19.703701",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5517-7f5b-a8e3-ca0338c04710",
            opprettet: "2025-11-17T13:43:19.703904",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: 1119,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5518-76d6-b936-2cdaff72c2c5",
            opprettet: "2025-11-17T13:43:19.704157",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
          {
            id: "019a91d7-5518-76d6-b936-2cdaff72c2c7",
            opprettet: "2025-11-17T13:43:19.704415",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: 0,
              datatype: "penger",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01992934-66e4-7606-bdd3-c6c9dd420ffd",
        navn: "Antall dager som er forbrukt",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d3-07aa-7081-92f2-c9f1d956a9b1",
            opprettet: "2025-11-17T13:38:37.738628",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: 1,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07ab-78a2-9ac7-2fa820ba8ec5",
            opprettet: "2025-11-17T13:38:37.739091",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: 2,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07ab-78a2-9ac7-2fa820ba8ec7",
            opprettet: "2025-11-17T13:38:37.739446",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: 3,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07ab-78a2-9ac7-2fa820ba8ec9",
            opprettet: "2025-11-17T13:38:37.739827",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: 4,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b0-77cd-8137-1aea75b7a105",
            opprettet: "2025-11-17T13:38:37.744107",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: 5,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b0-77cd-8137-1aea75b7a107",
            opprettet: "2025-11-17T13:38:37.744954",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: 5,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b1-74fd-9e97-73973b689866",
            opprettet: "2025-11-17T13:38:37.745629",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: 5,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b2-7704-a8ce-e20d0766d689",
            opprettet: "2025-11-17T13:38:37.746172",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: 6,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b2-7704-a8ce-e20d0766d68b",
            opprettet: "2025-11-17T13:38:37.746789",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: 7,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b3-7e12-abd5-795eef1b1520",
            opprettet: "2025-11-17T13:38:37.747282",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: 8,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b3-7e12-abd5-795eef1b1522",
            opprettet: "2025-11-17T13:38:37.74766",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: 9,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b4-7216-9a90-b4cc113dc30f",
            opprettet: "2025-11-17T13:38:37.748109",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: 10,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b4-7216-9a90-b4cc113dc311",
            opprettet: "2025-11-17T13:38:37.748426",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: 10,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b4-7216-9a90-b4cc113dc313",
            opprettet: "2025-11-17T13:38:37.748788",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: 10,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf6-73df-aa29-8cc8442b5757",
            opprettet: "2025-11-17T13:42:28.214053",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: 11,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf6-73df-aa29-8cc8442b5759",
            opprettet: "2025-11-17T13:42:28.214797",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: 12,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf7-7794-b9d8-724f60d50981",
            opprettet: "2025-11-17T13:42:28.215477",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: 13,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf7-7794-b9d8-724f60d50983",
            opprettet: "2025-11-17T13:42:28.215979",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: 14,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf8-717c-99c4-1e029196a5a1",
            opprettet: "2025-11-17T13:42:28.216415",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: 15,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf8-717c-99c4-1e029196a5a3",
            opprettet: "2025-11-17T13:42:28.216769",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: 15,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf9-72c0-b8f2-83816d5e3d8a",
            opprettet: "2025-11-17T13:42:28.217163",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: 15,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfa-745b-9f0a-61fd12450936",
            opprettet: "2025-11-17T13:42:28.218175",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: 16,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfb-763b-afaa-800de70678eb",
            opprettet: "2025-11-17T13:42:28.219077",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: 17,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfb-763b-afaa-800de70678ed",
            opprettet: "2025-11-17T13:42:28.219601",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: 18,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfc-7af0-bb0c-b9637c7c0a66",
            opprettet: "2025-11-17T13:42:28.220093",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: 19,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfc-7af0-bb0c-b9637c7c0a68",
            opprettet: "2025-11-17T13:42:28.220514",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: 20,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfc-7af0-bb0c-b9637c7c0a6a",
            opprettet: "2025-11-17T13:42:28.220911",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: 20,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfd-772c-9ed6-c3eceb91a429",
            opprettet: "2025-11-17T13:42:28.22141",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: 20,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2b-7cff-bbb4-734e6c4940da",
            opprettet: "2025-11-17T13:43:29.451109",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: 21,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2b-7cff-bbb4-734e6c4940dc",
            opprettet: "2025-11-17T13:43:29.451971",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: 22,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2e-746c-85ac-0b56823324e4",
            opprettet: "2025-11-17T13:43:29.454849",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: 23,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2f-7016-a065-5175f66c3da1",
            opprettet: "2025-11-17T13:43:29.455501",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: 24,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b30-7612-ae91-48abded81dcf",
            opprettet: "2025-11-17T13:43:29.456841",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: 25,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b31-742c-b82d-052b5741c2c1",
            opprettet: "2025-11-17T13:43:29.457514",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: 25,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b38-76cf-8370-f93b48797775",
            opprettet: "2025-11-17T13:43:29.464345",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: 25,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b38-76cf-8370-f93b48797777",
            opprettet: "2025-11-17T13:43:29.46493",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: 26,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b39-774d-a28c-ba0fd4ca8ec5",
            opprettet: "2025-11-17T13:43:29.465393",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: 27,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3a-71ed-90cf-838407d0ccd0",
            opprettet: "2025-11-17T13:43:29.466671",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: 28,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3b-7f46-ab83-5aac611d0fff",
            opprettet: "2025-11-17T13:43:29.467655",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: 29,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3c-753a-a3eb-5dcef14b80ae",
            opprettet: "2025-11-17T13:43:29.468307",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: 30,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3c-753a-a3eb-5dcef14b80b0",
            opprettet: "2025-11-17T13:43:29.468973",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: 30,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3d-7bd7-abbb-b930ebbaf0c5",
            opprettet: "2025-11-17T13:43:29.469637",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: 30,
              enhet: "dager",
              datatype: "heltall",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
      {
        opplysningTypeId: "01992956-e349-76b1-8f68-c9d481df3a32",
        navn: "Antall dager som gjenstår",
        datatype: "heltall",
        perioder: [
          {
            id: "019a91d3-07aa-7081-92f2-c9f1d956a9b2",
            opprettet: "2025-11-17T13:38:37.738924",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-02",
            gyldigTilOgMed: "2025-06-02",
            verdi: {
              verdi: 519,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07ab-78a2-9ac7-2fa820ba8ec6",
            opprettet: "2025-11-17T13:38:37.739289",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-03",
            gyldigTilOgMed: "2025-06-03",
            verdi: {
              verdi: 518,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07ab-78a2-9ac7-2fa820ba8ec8",
            opprettet: "2025-11-17T13:38:37.739599",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-04",
            gyldigTilOgMed: "2025-06-04",
            verdi: {
              verdi: 517,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07af-767f-9d88-de3bb188cdaa",
            opprettet: "2025-11-17T13:38:37.743874",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-05",
            gyldigTilOgMed: "2025-06-05",
            verdi: {
              verdi: 516,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b0-77cd-8137-1aea75b7a106",
            opprettet: "2025-11-17T13:38:37.74468",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-06",
            gyldigTilOgMed: "2025-06-06",
            verdi: {
              verdi: 515,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b1-74fd-9e97-73973b689865",
            opprettet: "2025-11-17T13:38:37.745376",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-07",
            gyldigTilOgMed: "2025-06-07",
            verdi: {
              verdi: 515,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b1-74fd-9e97-73973b689867",
            opprettet: "2025-11-17T13:38:37.7459",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-08",
            gyldigTilOgMed: "2025-06-08",
            verdi: {
              verdi: 515,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b2-7704-a8ce-e20d0766d68a",
            opprettet: "2025-11-17T13:38:37.746458",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-09",
            gyldigTilOgMed: "2025-06-09",
            verdi: {
              verdi: 514,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b3-7e12-abd5-795eef1b151f",
            opprettet: "2025-11-17T13:38:37.747049",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-10",
            gyldigTilOgMed: "2025-06-10",
            verdi: {
              verdi: 513,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b3-7e12-abd5-795eef1b1521",
            opprettet: "2025-11-17T13:38:37.747465",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-11",
            gyldigTilOgMed: "2025-06-11",
            verdi: {
              verdi: 512,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b3-7e12-abd5-795eef1b1523",
            opprettet: "2025-11-17T13:38:37.747953",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-12",
            gyldigTilOgMed: "2025-06-12",
            verdi: {
              verdi: 511,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b4-7216-9a90-b4cc113dc310",
            opprettet: "2025-11-17T13:38:37.748281",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-13",
            gyldigTilOgMed: "2025-06-13",
            verdi: {
              verdi: 510,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b4-7216-9a90-b4cc113dc312",
            opprettet: "2025-11-17T13:38:37.748603",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-14",
            gyldigTilOgMed: "2025-06-14",
            verdi: {
              verdi: 510,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d3-07b4-7216-9a90-b4cc113dc314",
            opprettet: "2025-11-17T13:38:37.748933",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-15",
            gyldigTilOgMed: "2025-06-15",
            verdi: {
              verdi: 510,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf6-73df-aa29-8cc8442b5758",
            opprettet: "2025-11-17T13:42:28.214467",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-16",
            gyldigTilOgMed: "2025-06-16",
            verdi: {
              verdi: 509,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf7-7794-b9d8-724f60d50980",
            opprettet: "2025-11-17T13:42:28.215088",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-17",
            gyldigTilOgMed: "2025-06-17",
            verdi: {
              verdi: 508,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf7-7794-b9d8-724f60d50982",
            opprettet: "2025-11-17T13:42:28.215737",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-18",
            gyldigTilOgMed: "2025-06-18",
            verdi: {
              verdi: 507,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf8-717c-99c4-1e029196a5a0",
            opprettet: "2025-11-17T13:42:28.216226",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-19",
            gyldigTilOgMed: "2025-06-19",
            verdi: {
              verdi: 506,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf8-717c-99c4-1e029196a5a2",
            opprettet: "2025-11-17T13:42:28.216591",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-20",
            gyldigTilOgMed: "2025-06-20",
            verdi: {
              verdi: 505,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf8-717c-99c4-1e029196a5a4",
            opprettet: "2025-11-17T13:42:28.216945",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-21",
            gyldigTilOgMed: "2025-06-21",
            verdi: {
              verdi: 505,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bf9-72c0-b8f2-83816d5e3d8b",
            opprettet: "2025-11-17T13:42:28.217732",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-22",
            gyldigTilOgMed: "2025-06-22",
            verdi: {
              verdi: 505,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfa-745b-9f0a-61fd12450937",
            opprettet: "2025-11-17T13:42:28.218582",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-23",
            gyldigTilOgMed: "2025-06-23",
            verdi: {
              verdi: 504,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfb-763b-afaa-800de70678ec",
            opprettet: "2025-11-17T13:42:28.219355",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-24",
            gyldigTilOgMed: "2025-06-24",
            verdi: {
              verdi: 503,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfb-763b-afaa-800de70678ee",
            opprettet: "2025-11-17T13:42:28.219892",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-25",
            gyldigTilOgMed: "2025-06-25",
            verdi: {
              verdi: 502,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfc-7af0-bb0c-b9637c7c0a67",
            opprettet: "2025-11-17T13:42:28.22032",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-26",
            gyldigTilOgMed: "2025-06-26",
            verdi: {
              verdi: 501,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfc-7af0-bb0c-b9637c7c0a69",
            opprettet: "2025-11-17T13:42:28.220717",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-27",
            gyldigTilOgMed: "2025-06-27",
            verdi: {
              verdi: 500,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfd-772c-9ed6-c3eceb91a428",
            opprettet: "2025-11-17T13:42:28.221141",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-28",
            gyldigTilOgMed: "2025-06-28",
            verdi: {
              verdi: 500,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d6-8bfd-772c-9ed6-c3eceb91a42a",
            opprettet: "2025-11-17T13:42:28.221678",
            status: "Arvet",
            opprinnelse: "Arvet",
            gyldigFraOgMed: "2025-06-29",
            gyldigTilOgMed: "2025-06-29",
            verdi: {
              verdi: 500,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2b-7cff-bbb4-734e6c4940db",
            opprettet: "2025-11-17T13:43:29.451554",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-06-30",
            gyldigTilOgMed: "2025-06-30",
            verdi: {
              verdi: 499,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2e-746c-85ac-0b56823324e3",
            opprettet: "2025-11-17T13:43:29.454394",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-01",
            gyldigTilOgMed: "2025-07-01",
            verdi: {
              verdi: 498,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b2f-7016-a065-5175f66c3da0",
            opprettet: "2025-11-17T13:43:29.455181",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-02",
            gyldigTilOgMed: "2025-07-02",
            verdi: {
              verdi: 497,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b30-7612-ae91-48abded81dce",
            opprettet: "2025-11-17T13:43:29.456497",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-03",
            gyldigTilOgMed: "2025-07-03",
            verdi: {
              verdi: 496,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b31-742c-b82d-052b5741c2c0",
            opprettet: "2025-11-17T13:43:29.45717",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-04",
            gyldigTilOgMed: "2025-07-04",
            verdi: {
              verdi: 495,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b31-742c-b82d-052b5741c2c2",
            opprettet: "2025-11-17T13:43:29.457983",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-05",
            gyldigTilOgMed: "2025-07-05",
            verdi: {
              verdi: 495,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b38-76cf-8370-f93b48797776",
            opprettet: "2025-11-17T13:43:29.464663",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-06",
            gyldigTilOgMed: "2025-07-06",
            verdi: {
              verdi: 495,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b39-774d-a28c-ba0fd4ca8ec4",
            opprettet: "2025-11-17T13:43:29.46517",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-07",
            gyldigTilOgMed: "2025-07-07",
            verdi: {
              verdi: 494,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3a-71ed-90cf-838407d0cccf",
            opprettet: "2025-11-17T13:43:29.466055",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-08",
            gyldigTilOgMed: "2025-07-08",
            verdi: {
              verdi: 493,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3b-7f46-ab83-5aac611d0ffe",
            opprettet: "2025-11-17T13:43:29.467277",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-09",
            gyldigTilOgMed: "2025-07-09",
            verdi: {
              verdi: 492,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3c-753a-a3eb-5dcef14b80ad",
            opprettet: "2025-11-17T13:43:29.468058",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-10",
            gyldigTilOgMed: "2025-07-10",
            verdi: {
              verdi: 491,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3c-753a-a3eb-5dcef14b80af",
            opprettet: "2025-11-17T13:43:29.468614",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-11",
            gyldigTilOgMed: "2025-07-11",
            verdi: {
              verdi: 490,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3d-7bd7-abbb-b930ebbaf0c4",
            opprettet: "2025-11-17T13:43:29.469315",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-12",
            gyldigTilOgMed: "2025-07-12",
            verdi: {
              verdi: 490,
              enhet: "dager",
              datatype: "heltall",
            },
          },
          {
            id: "019a91d7-7b3d-7bd7-abbb-b930ebbaf0c6",
            opprettet: "2025-11-17T13:43:29.46991",
            status: "Ny",
            opprinnelse: "Ny",
            gyldigFraOgMed: "2025-07-13",
            gyldigTilOgMed: "2025-07-13",
            verdi: {
              verdi: 490,
              enhet: "dager",
              datatype: "heltall",
            },
          },
        ],
        synlig: true,
        redigerbar: false,
        redigertAvSaksbehandler: false,
        formål: "Regel",
      },
    ],
  };
}

export function hentBehandlingsresultat(
  person: IPerson,
  rapporteringsperioder: IRapporteringsperiode[],
  arbeidssokerperioder: IArbeidssokerperiode[],
) {
  const meldekortPerArbeidssokerperiode = arbeidssokerperioder
    .map((arbeidssokerperiode) =>
      rapporteringsperioder.filter((meldekort) =>
        overlapper(
          { ...meldekort.periode },
          {
            fraOgMed: arbeidssokerperiode.startDato,
            tilOgMed: arbeidssokerperiode.sluttDato || undefined,
          },
        ),
      ),
    )
    // Fjerner meldekort som allerede er tatt med i en tidligere arbeidssøkerperiode
    .reduce((acc: IRapporteringsperiode[][], curr: IRapporteringsperiode[]) => {
      const duplicates = curr.filter((meldekort) =>
        acc
          .flat()
          .some(
            (m) =>
              m.periode.fraOgMed === meldekort.periode.fraOgMed &&
              m.periode.tilOgMed === meldekort.periode.tilOgMed,
          ),
      );

      return [
        ...acc,
        curr.filter((meldekort) => !duplicates.map((d) => d.id).includes(meldekort.id)),
      ];
    }, []);

  return meldekortPerArbeidssokerperiode.map((meldekort) => mockBehandling(person, meldekort));
}
