import { describe, expect, it } from "vitest";

import { AKTIVITET_TYPE } from "./constants";
import type {
  ISkjemaData,
  ISkjemaRefs,
  IValideringsKontekst,
} from "./meldekort-validering.helpers";
import {
  fokuserPaForsteFeil,
  harAktivitetEndringer,
  harGyldigeAktiviteter,
  harMeldedatoEndring,
  harSkjemaEndringer,
  lagValideringsFeilmeldinger,
  skalViseArbeidssokerSporsmal,
  validerMeldekortSkjema,
} from "./meldekort-validering.helpers";
import type { IRapporteringsperiodeDag } from "./types";

describe("meldekort-validering.helpers", () => {
  const baseDag: IRapporteringsperiodeDag = {
    type: "dag",
    dato: "2024-01-01",
    dagIndex: 0,
    aktiviteter: [],
  };

  describe("skalViseArbeidssokerSporsmal", () => {
    // TODO: Oppdater disse testene når backend har lagt til "etterregistrert" type
    it("skal alltid vise spørsmålet (inntil backend er klar)", () => {
      expect(skalViseArbeidssokerSporsmal("ordinaer", false)).toBe(true);
      expect(skalViseArbeidssokerSporsmal("ordinaer", true)).toBe(true);
      expect(skalViseArbeidssokerSporsmal("korrigert", true)).toBe(true);
      expect(skalViseArbeidssokerSporsmal(undefined, true)).toBe(true);
      expect(skalViseArbeidssokerSporsmal(undefined, false)).toBe(true);
    });

    // TODO: Aktiver disse testene når backend er klar
    // it("skal alltid vise spørsmålet i brukerflaten", () => {
    //   expect(skalViseArbeidssokerSporsmal("ordinaer", false)).toBe(true);
    //   expect(skalViseArbeidssokerSporsmal("etterregistrert", false)).toBe(true);
    //   expect(skalViseArbeidssokerSporsmal(undefined, false)).toBe(true);
    // });
    //
    // it("skal vise spørsmålet i saksbehandlerflaten for ordinære meldekort", () => {
    //   expect(skalViseArbeidssokerSporsmal("ordinaer", true)).toBe(true);
    //   expect(skalViseArbeidssokerSporsmal("korrigert", true)).toBe(true);
    // });
    //
    // it("skal IKKE vise spørsmålet i saksbehandlerflaten for etterregistrerte meldekort", () => {
    //   expect(skalViseArbeidssokerSporsmal("etterregistrert", true)).toBe(false);
    // });
    //
    // it("skal vise spørsmålet når meldekorttype er undefined i saksbehandlerflaten", () => {
    //   expect(skalViseArbeidssokerSporsmal(undefined, true)).toBe(true);
    // });
  });

  describe("harAktivitetEndringer", () => {
    /**
     * Denne funksjonen brukes til å detektere om bruker har gjort endringer i aktiviteter
     * under korrigering. Dette er viktig fordi:
     * 1. Vi må kreve begrunnelse hvis noe er endret
     * 2. Vi må kunne advare bruker om usaved changes
     * 3. Vi må validere at minst én endring er gjort ved korrigering
     */
    it("skal returnere false når ingen aktiviteter har endret seg", () => {
      // Test at identiske aktiviteter ikke detekteres som endring
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(false);
    });

    it("skal returnere true når antall dager har endret seg", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
        { ...baseDag, dato: "2024-01-02", dagIndex: 1, aktiviteter: [] },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });

    it("skal returnere true når aktivitetstype har endret seg", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });

    it("skal returnere true når timer har endret seg", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "8" }],
        },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });

    it("skal returnere true når antall aktiviteter per dag har endret seg", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [
            { type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" },
            { type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" },
          ],
        },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });

    it("skal returnere true når en aktivitet er lagt til", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });

    it("skal returnere true når en aktivitet er fjernet", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
        },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });

    it("skal håndtere flere dager korrekt", () => {
      const opprinneligeDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          dagIndex: 1,
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
        },
      ];

      const redigerteDager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "8" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          dagIndex: 1,
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
        },
      ];

      expect(harAktivitetEndringer(opprinneligeDager, redigerteDager)).toBe(true);
    });
  });

  describe("harMeldedatoEndring", () => {
    it("skal returnere false når begge er null", () => {
      expect(harMeldedatoEndring(null, null)).toBe(false);
    });

    it("skal returnere false når ny meldedato er null", () => {
      expect(harMeldedatoEndring("2024-01-15", null)).toBe(false);
    });

    it("skal returnere true når original er null og ny er satt", () => {
      const nyDato = new Date(2024, 0, 15); // 15. januar 2024
      expect(harMeldedatoEndring(null, nyDato)).toBe(true);
    });

    it("skal returnere false når datoene er like", () => {
      const nyDato = new Date(2024, 0, 15);
      expect(harMeldedatoEndring("2024-01-15", nyDato)).toBe(false);
    });

    it("skal returnere true når datoene er forskjellige", () => {
      const nyDato = new Date(2024, 0, 20);
      expect(harMeldedatoEndring("2024-01-15", nyDato)).toBe(true);
    });

    it("skal håndtere datoer med forskjellige måneder", () => {
      const nyDato = new Date(2024, 1, 15); // Februar
      expect(harMeldedatoEndring("2024-01-15", nyDato)).toBe(true);
    });

    it("skal håndtere datoer med forskjellige år", () => {
      const nyDato = new Date(2025, 0, 15);
      expect(harMeldedatoEndring("2024-01-15", nyDato)).toBe(true);
    });
  });

  describe("harSkjemaEndringer", () => {
    it("skal returnere true når det ikke er korrigering", () => {
      const skjemaData: ISkjemaData = {
        meldedato: null,
        registrertArbeidssoker: null,
        begrunnelse: "",
        dager: [],
      };

      const kontekst: IValideringsKontekst = {
        isKorrigering: false,
        showArbeidssokerField: true,
      };

      expect(harSkjemaEndringer(skjemaData, kontekst)).toBe(true);
    });

    it("skal returnere true når meldedato har endret seg", () => {
      const skjemaData: ISkjemaData = {
        meldedato: new Date(2024, 0, 20),
        registrertArbeidssoker: true,
        begrunnelse: "Test",
        dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
      };

      const kontekst: IValideringsKontekst = {
        isKorrigering: true,
        showArbeidssokerField: false,
        originalData: {
          meldedato: "2024-01-15",
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
        },
      };

      expect(harSkjemaEndringer(skjemaData, kontekst)).toBe(true);
    });

    it("skal returnere true når aktiviteter har endret seg", () => {
      const skjemaData: ISkjemaData = {
        meldedato: new Date(2024, 0, 15),
        registrertArbeidssoker: true,
        begrunnelse: "Test",
        dager: [
          {
            ...baseDag,
            dato: "2024-01-01",
            aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
          },
        ],
      };

      const kontekst: IValideringsKontekst = {
        isKorrigering: true,
        showArbeidssokerField: false,
        originalData: {
          meldedato: "2024-01-15",
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
        },
      };

      expect(harSkjemaEndringer(skjemaData, kontekst)).toBe(true);
    });

    it("skal returnere false når ingen endringer ved korrigering", () => {
      const skjemaData: ISkjemaData = {
        meldedato: new Date(2024, 0, 15),
        registrertArbeidssoker: true,
        begrunnelse: "Test",
        dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
      };

      const kontekst: IValideringsKontekst = {
        isKorrigering: true,
        showArbeidssokerField: false,
        originalData: {
          meldedato: "2024-01-15",
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
        },
      };

      expect(harSkjemaEndringer(skjemaData, kontekst)).toBe(false);
    });
  });

  describe("harGyldigeAktiviteter", () => {
    it("skal returnere false når ingen dager har aktiviteter", () => {
      const dager: IRapporteringsperiodeDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
        { ...baseDag, dato: "2024-01-02", dagIndex: 1, aktiviteter: [] },
      ];

      expect(harGyldigeAktiviteter(dager)).toBe(false);
    });

    it("skal returnere true når minst én dag har aktivitet", () => {
      const dager: IRapporteringsperiodeDag[] = [
        { ...baseDag, dato: "2024-01-01", aktiviteter: [] },
        {
          ...baseDag,
          dato: "2024-01-02",
          dagIndex: 1,
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
        },
      ];

      expect(harGyldigeAktiviteter(dager)).toBe(true);
    });

    it("skal returnere false når dager-array er tom", () => {
      expect(harGyldigeAktiviteter([])).toBe(false);
    });

    it("skal returnere true når flere dager har aktiviteter", () => {
      const dager: IRapporteringsperiodeDag[] = [
        {
          ...baseDag,
          dato: "2024-01-01",
          aktiviteter: [{ type: AKTIVITET_TYPE.Arbeid, dato: "2024-01-01", timer: "7.5" }],
        },
        {
          ...baseDag,
          dato: "2024-01-02",
          dagIndex: 1,
          aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-02" }],
        },
      ];

      expect(harGyldigeAktiviteter(dager)).toBe(true);
    });
  });

  describe("validerMeldekortSkjema", () => {
    describe("Fyll ut validering", () => {
      it("skal kreve meldedato", () => {
        const skjemaData: ISkjemaData = {
          meldedato: null,
          registrertArbeidssoker: true,
          begrunnelse: "Test",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: true,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.meldedato).toBe(true);
      });

      it("skal kreve svar på arbeidssøker når feltet vises", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(),
          registrertArbeidssoker: null,
          begrunnelse: "Test",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: true,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.arbeidssoker).toBe(true);
      });

      it("skal IKKE kreve svar på arbeidssøker når feltet er skjult", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(),
          registrertArbeidssoker: null,
          begrunnelse: "Test",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: false,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.arbeidssoker).toBe(false);
      });

      it("skal kreve begrunnelse", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(),
          registrertArbeidssoker: true,
          begrunnelse: "",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: true,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.begrunnelse).toBe(true);
      });

      it("skal trimme begrunnelse før validering", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(),
          registrertArbeidssoker: true,
          begrunnelse: "   ",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: true,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.begrunnelse).toBe(true);
      });

      it("skal IKKE kreve aktiviteter ved fyll ut", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(),
          registrertArbeidssoker: true,
          begrunnelse: "Test",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: true,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.aktiviteter).toBe(false);
      });

      it("skal godkjenne gyldig fyll ut skjema", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(),
          registrertArbeidssoker: true,
          begrunnelse: "Gyldige opplysninger",
          dager: [],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: false,
          showArbeidssokerField: true,
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.meldedato).toBe(false);
        expect(feil.arbeidssoker).toBe(false);
        expect(feil.begrunnelse).toBe(false);
        expect(feil.aktiviteter).toBe(false);
      });
    });

    describe("Korrigering validering", () => {
      /**
       * Korrigering har strengere valideringsregler enn vanlig utfylling:
       * 1. Begrunnelse er ALLTID påkrevd (for audit trail)
       * 2. Det må være minst én faktisk endring (meldedato ELLER aktiviteter)
       * 3. Hvis ingen endring er gjort, skal det vises feilmelding
       *
       * Dette sikrer at saksbehandler ikke kan sende inn "tomme" korrigeringer
       * og at alle korrigeringer har dokumentert hvorfor de ble gjort.
       */
      it("skal kreve begrunnelse ved korrigering", () => {
        // Begrunnelse er alltid påkrevd ved korrigering, uavhengig av hva som endres
        const skjemaData: ISkjemaData = {
          meldedato: new Date(2024, 0, 20), // Meldedato er endret (fra 15. til 20. januar)
          registrertArbeidssoker: true,
          begrunnelse: "", // Tom begrunnelse skal gi feil
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: true,
          showArbeidssokerField: false,
          originalData: {
            meldedato: "2024-01-15", // Original meldedato
            dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
          },
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.begrunnelse).toBe(true);
      });

      it("skal kreve endringer (meldedato eller aktivitet) ved korrigering", () => {
        // Hvis ingenting er endret, skal det være valideringsfeil
        // Dette forhindrer at saksbehandler sender inn "tomme" korrigeringer
        const skjemaData: ISkjemaData = {
          meldedato: new Date(2024, 0, 15), // Samme dato som original
          registrertArbeidssoker: true,
          begrunnelse: "Korrigering", // Begrunnelse er OK
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }], // Ingen aktiviteter endret
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: true,
          showArbeidssokerField: false,
          originalData: {
            meldedato: "2024-01-15", // Samme som ny meldedato
            dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }], // Identisk med nye dager
          },
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.aktiviteter).toBe(true); // Skal feile fordi ingen endringer er gjort
      });

      it("skal godkjenne korrigering med endret meldedato", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(2024, 0, 20),
          registrertArbeidssoker: true,
          begrunnelse: "Korrigert meldedato",
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: true,
          showArbeidssokerField: false,
          originalData: {
            meldedato: "2024-01-15",
            dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
          },
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.meldedato).toBe(false);
        expect(feil.begrunnelse).toBe(false);
        expect(feil.aktiviteter).toBe(false);
      });

      it("skal godkjenne korrigering med endret aktivitet", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(2024, 0, 15),
          registrertArbeidssoker: true,
          begrunnelse: "Lagt til sykdom",
          dager: [
            {
              ...baseDag,
              dato: "2024-01-01",
              aktiviteter: [{ type: AKTIVITET_TYPE.Syk, dato: "2024-01-01" }],
            },
          ],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: true,
          showArbeidssokerField: false,
          originalData: {
            meldedato: "2024-01-15",
            dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
          },
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.aktiviteter).toBe(false);
        expect(feil.begrunnelse).toBe(false);
      });

      it("skal IKKE kreve arbeidssøker-svar ved korrigering", () => {
        const skjemaData: ISkjemaData = {
          meldedato: new Date(2024, 0, 20),
          registrertArbeidssoker: null,
          begrunnelse: "Korrigering",
          dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
        };

        const kontekst: IValideringsKontekst = {
          isKorrigering: true,
          showArbeidssokerField: false,
          originalData: {
            meldedato: "2024-01-15",
            dager: [{ ...baseDag, dato: "2024-01-01", aktiviteter: [] }],
          },
        };

        const feil = validerMeldekortSkjema(skjemaData, kontekst);
        expect(feil.arbeidssoker).toBe(false);
      });
    });
  });

  describe("fokuserPaForsteFeil", () => {
    it("skal fokusere på meldedato hvis det er den første feilen", () => {
      const mockFocus = { current: { focus: () => {} } };
      let focused = "";

      const refs: ISkjemaRefs = {
        meldedatoRef: {
          current: {
            focus: () => {
              focused = "meldedato";
            },
          } as HTMLButtonElement,
        },
        arbeidssokerRef: mockFocus as unknown as ISkjemaRefs["arbeidssokerRef"],
        begrunnelseRef: mockFocus as unknown as ISkjemaRefs["begrunnelseRef"],
        aktiviteterRef: mockFocus as unknown as ISkjemaRefs["aktiviteterRef"],
      };

      const feil = {
        meldedato: true,
        arbeidssoker: true,
        begrunnelse: true,
        aktiviteter: true,
      };

      fokuserPaForsteFeil(feil, refs);
      expect(focused).toBe("meldedato");
    });

    it("skal fokusere på arbeidssøker hvis det er den første feilen", () => {
      const mockFocus = { current: { focus: () => {} } };
      let focused = "";

      const refs: ISkjemaRefs = {
        meldedatoRef: mockFocus as unknown as ISkjemaRefs["meldedatoRef"],
        arbeidssokerRef: {
          current: {
            focus: () => {
              focused = "arbeidssoker";
            },
          } as HTMLFieldSetElement,
        },
        begrunnelseRef: mockFocus as unknown as ISkjemaRefs["begrunnelseRef"],
        aktiviteterRef: mockFocus as unknown as ISkjemaRefs["aktiviteterRef"],
      };

      const feil = {
        meldedato: false,
        arbeidssoker: true,
        begrunnelse: true,
        aktiviteter: true,
      };

      fokuserPaForsteFeil(feil, refs);
      expect(focused).toBe("arbeidssoker");
    });

    it("skal fokusere på begrunnelse hvis det er den første feilen", () => {
      const mockFocus = { current: { focus: () => {} } };
      let focused = "";

      const refs: ISkjemaRefs = {
        meldedatoRef: mockFocus as unknown as ISkjemaRefs["meldedatoRef"],
        arbeidssokerRef: mockFocus as unknown as ISkjemaRefs["arbeidssokerRef"],
        begrunnelseRef: {
          current: {
            focus: () => {
              focused = "begrunnelse";
            },
          } as HTMLTextAreaElement,
        },
        aktiviteterRef: mockFocus as unknown as ISkjemaRefs["aktiviteterRef"],
      };

      const feil = {
        meldedato: false,
        arbeidssoker: false,
        begrunnelse: true,
        aktiviteter: true,
      };

      fokuserPaForsteFeil(feil, refs);
      expect(focused).toBe("begrunnelse");
    });

    it("skal fokusere på aktiviteter hvis det er den eneste feilen", () => {
      const mockFocus = { current: { focus: () => {} } };
      let focused = "";

      const refs: ISkjemaRefs = {
        meldedatoRef: mockFocus as unknown as ISkjemaRefs["meldedatoRef"],
        arbeidssokerRef: mockFocus as unknown as ISkjemaRefs["arbeidssokerRef"],
        begrunnelseRef: mockFocus as unknown as ISkjemaRefs["begrunnelseRef"],
        aktiviteterRef: {
          current: {
            focus: () => {
              focused = "aktiviteter";
            },
          } as HTMLElement,
        },
      };

      const feil = {
        meldedato: false,
        arbeidssoker: false,
        begrunnelse: false,
        aktiviteter: true,
      };

      fokuserPaForsteFeil(feil, refs);
      expect(focused).toBe("aktiviteter");
    });

    it("skal ikke krasje hvis ingen refs er satt", () => {
      const refs: ISkjemaRefs = {
        meldedatoRef: { current: null },
        arbeidssokerRef: { current: null },
        begrunnelseRef: { current: null },
        aktiviteterRef: { current: null },
      };

      const feil = {
        meldedato: true,
        arbeidssoker: true,
        begrunnelse: true,
        aktiviteter: true,
      };

      expect(() => fokuserPaForsteFeil(feil, refs)).not.toThrow();
    });
  });

  describe("lagValideringsFeilmeldinger", () => {
    it("skal returnere feilmeldinger for fyll ut", () => {
      const kontekst: IValideringsKontekst = {
        isKorrigering: false,
        showArbeidssokerField: true,
      };

      const meldinger = lagValideringsFeilmeldinger(kontekst);

      expect(meldinger.meldedato).toContain("velge en meldedato");
      expect(meldinger.arbeidssoker).toContain("arbeidssøker");
      expect(meldinger.begrunnelse).toContain("begrunnelse");
      expect(meldinger.aktiviteter).toBe("");
    });

    it("skal returnere feilmeldinger for korrigering", () => {
      const kontekst: IValideringsKontekst = {
        isKorrigering: true,
        showArbeidssokerField: false,
        originalData: {
          meldedato: "2024-01-15",
          dager: [],
        },
      };

      const meldinger = lagValideringsFeilmeldinger(kontekst);

      expect(meldinger.meldedato).toContain("velge en meldedato");
      expect(meldinger.arbeidssoker).toBe("");
      expect(meldinger.begrunnelse).toContain("korrigering");
      expect(meldinger.aktiviteter).toContain("endre");
    });
  });
});
