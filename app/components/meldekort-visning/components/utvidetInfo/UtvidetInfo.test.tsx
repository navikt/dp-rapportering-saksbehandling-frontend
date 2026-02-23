import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { IMeldekortHovedside } from "~/sanity/sider/hovedside/types";
import { ANSVARLIG_SYSTEM, MELDEKORT_TYPE, OPPRETTET_AV, ROLLE } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import { UtvidetInfo } from "./UtvidetInfo";

// Mock Sanity data for testing
const mockHovedsideData: IMeldekortHovedside = {
  overskrift: "Meldekort",
  listeOverskrift: "Meldekortliste",
  tabellKolonner: {
    uke: "Uke",
    dato: "Dato",
    status: "Status",
    aktiviteter: "Aktiviteter",
    meldedato: "Meldedato",
    frist: "Frist",
  },
  utvidetVisning: {
    overskrift: "Uke {{uker}}",
    emptyCardMessage: "Dette meldekortet er ikke fylt ut enda.",
    aktiviteterTittel: "Aktiviteter",
    noActivitiesText: "Ingen aktiviteter registrert",
    tabellTittel: "Detaljert informasjon om meldekortet",
    infoLabels: {
      meldedato: "Meldedato:",
      datoForInnsending: "Dato for innsending:",
      datoForKorrigering: "Dato for korrigering:",
      korrigertAv: "Korrigert av:",
      innsendtAv: "Innsendt av:",
      begrunnelse: {
        label: "Begrunnelse:",
        visMer: "Vis mer",
        visMindre: "Vis mindre",
      },
      svarPaaArbeidssoekerregistrering: "Svar på spørsmål om arbeidssøkerregistrering:",
      beregnetBruttobelop: "Beregnet bruttobeløp:",
      periodenBeregningenGjelderFor: "Perioden beregningen gjelder for:",
    },
  },
  knapper: {
    korrigerMeldekort: "Korriger meldekort",
    fyllutMeldekort: "Fyll ut meldekort",
  },
  varsler: {
    forSentInnsendt: "Dette meldekortet er sendt inn {{antall}} {{dager}} etter fristen.",
    fraArena: "Dette meldekortet er opprettet i Arena",
    korrigeringAvArenaMeldekort: "string",
    etterregistrert: "Dette meldekortet er etterregistrert",
    kanIkkeEndres: "Dette meldekortet kan ikke endres",
    belopSamsvarerIkke: "Beløpet samsvarer ikke med perioden",
  },
};

describe("UtvidetInfo", () => {
  const basePeriode: IRapporteringsperiode = {
    id: "test-1",
    ident: "12345678901",
    type: MELDEKORT_TYPE.ORDINAERT,
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [],
    kanSendes: false,
    kanEndres: false,
    kanSendesFra: "2024-01-14T00:00:00",
    sisteFristForTrekk: null,
    status: "Innsendt",
    opprettetAv: OPPRETTET_AV.Dagpenger,
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
  };

  describe("Rendering av detaljer", () => {
    it("skal ha tilgjengelig caption for skjermlesere", () => {
      render(
        <UtvidetInfo
          periode={basePeriode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      const caption = screen.getByText("Detaljert informasjon om meldekortet");
      expect(caption).toHaveClass("sr-only");
    });

    it("skal vise meldedato når den finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: "2024-01-15",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Meldedato:")).toBeInTheDocument();
      expect(screen.getByText("15. januar 2024")).toBeInTheDocument();
    });

    it("skal ikke vise meldedato når den ikke finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByText("Meldedato:")).not.toBeInTheDocument();
    });

    it("skal vise innsendingstidspunkt med 'innsending' label når ikke korrigert", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        innsendtTidspunkt: "2024-01-15T10:30:00Z",
        originalMeldekortId: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Dato for innsending:")).toBeInTheDocument();
      expect(screen.getByText("15. januar 2024")).toBeInTheDocument();
    });

    it("skal vise innsendingstidspunkt med 'korrigering' label når korrigert", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        innsendtTidspunkt: "2024-01-15T10:30:00Z",
        originalMeldekortId: "original-123",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Dato for korrigering:")).toBeInTheDocument();
    });

    it("skal ikke vise innsendingstidspunkt når den ikke finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        innsendtTidspunkt: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByText(/Dato for/)).not.toBeInTheDocument();
    });
  });

  describe("Rendering av kilde-informasjon", () => {
    it("skal ikke vise kilde når innsendt av bruker uten korrigering", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: {
          rolle: "Bruker",
          ident: "12345678901",
        },
        originalMeldekortId: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      // Skal ikke vise kilde når verken korrigert eller saksbehandler
      expect(screen.queryByText(/av:/)).not.toBeInTheDocument();
    });

    it("skal vise 'Korrigert av' med ident når korrigert av saksbehandler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: {
          rolle: ROLLE.Saksbehandler,
          ident: "Z123456",
        },
        originalMeldekortId: "original-123",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Korrigert av:")).toBeInTheDocument();
      expect(screen.getByText("Z123456")).toBeInTheDocument();
    });

    it("skal vise 'Innsendt av' med ident når innsendt av saksbehandler", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: {
          rolle: ROLLE.Saksbehandler,
          ident: "Z123456",
        },
        originalMeldekortId: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Innsendt av:")).toBeInTheDocument();
      expect(screen.getByText("Z123456")).toBeInTheDocument();
    });

    it("skal vise 'Innsendt av' med rolle når bruker korrigerer", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: {
          rolle: "Bruker",
          ident: "12345678901",
        },
        originalMeldekortId: "original-123",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      // Skal vise "Korrigert av" med rolle fordi det er korrigert
      expect(screen.getByText("Korrigert av:")).toBeInTheDocument();
      expect(screen.getByText("Bruker")).toBeInTheDocument();
    });

    it("skal ikke vise kilde når kilde er null", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kilde: null,
        originalMeldekortId: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByText(/av:/)).not.toBeInTheDocument();
    });
  });

  describe("Rendering av begrunnelse", () => {
    it("skal vise begrunnelse når den finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        begrunnelse: "Dette er en testbegrunnelse",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Begrunnelse:")).toBeInTheDocument();
      expect(screen.getByText("Dette er en testbegrunnelse")).toBeInTheDocument();
    });

    it("skal ikke vise begrunnelse når den ikke finnes", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        begrunnelse: undefined,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByText("Begrunnelse:")).not.toBeInTheDocument();
    });
  });

  describe("TruncatedText funksjonalitet", () => {
    it("skal ha aria-live attributt på begrunnelse tekst", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        begrunnelse: "En kort begrunnelse",
      };

      const { container } = render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      const ariaLiveElement = container.querySelector('[aria-live="polite"]');
      expect(ariaLiveElement).toBeInTheDocument();
    });
  });

  describe("Rendering av arbeidssøker-spørsmål", () => {
    it("skal vise 'Ja' når registrertArbeidssoker er true", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        registrertArbeidssoker: true,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Svar på spørsmål om arbeidssøkerregistrering:")).toBeInTheDocument();
      expect(screen.getByText("Ja")).toBeInTheDocument();
    });

    it("skal vise 'Nei' når registrertArbeidssoker er false", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        registrertArbeidssoker: false,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText("Svar på spørsmål om arbeidssøkerregistrering:")).toBeInTheDocument();
      expect(screen.getByText("Nei")).toBeInTheDocument();
    });

    it("skal ikke vise arbeidssøker-spørsmål når registrertArbeidssoker er null", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        registrertArbeidssoker: null,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(
        screen.queryByText("Svar på spørsmål om arbeidssøkerregistrering:"),
      ).not.toBeInTheDocument();
    });

    it("skal ikke vise arbeidssøker-spørsmål når registrertArbeidssoker mangler", () => {
      const periode = {
        ...basePeriode,
      } as IRapporteringsperiode;
      // Eksplisitt ikke setter registrertArbeidssoker

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(
        screen.queryByText("Svar på spørsmål om arbeidssøkerregistrering:"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Alert for for sent innsendt", () => {
    it("skal vise advarsel når meldekort er sendt for sent", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: "2024-01-20",
        sisteFristForTrekk: "2024-01-17",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText(/dette meldekortet er sendt inn/i)).toBeInTheDocument();
      expect(screen.getByText(/etter fristen/i)).toBeInTheDocument();
    });

    it("skal vise korrekt antall dager når sendt 1 dag for sent", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: "2024-01-17",
        sisteFristForTrekk: "2024-01-16",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.getByText(/1 dag etter fristen/i)).toBeInTheDocument();
    });

    it("skal vise korrekt antall dager når sendt flere dager for sent", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: "2024-01-20",
        sisteFristForTrekk: "2024-01-17",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      // Skal inneholde "dager" (flertall)
      expect(screen.getByText(/3 dager etter fristen/i)).toBeInTheDocument();
    });

    it("skal ikke vise advarsel når meldekort er sendt i tide", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: "2024-01-15",
        sisteFristForTrekk: "2024-01-20",
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByText(/sendt inn .* etter fristen/i)).not.toBeInTheDocument();
    });
  });

  describe("Korriger meldekort knapp", () => {
    it("skal vise 'Korriger meldekort' knapp når kanEndres er true og ansvarlig system er DP", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: true,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      const knapp = screen.getByRole("button", { name: /korriger meldekort/i });
      expect(knapp).toBeInTheDocument();
      expect(knapp).toHaveAttribute("href", "/person/123/periode/test-1/korriger");
    });

    it("skal ikke vise 'Korriger meldekort' knapp når kanEndres er false", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: false,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByRole("button", { name: /korriger meldekort/i })).not.toBeInTheDocument();
    });

    it("skal ikke vise 'Korriger meldekort' knapp når ansvarlig system er ARENA", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        kanEndres: true,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.ARENA}
          hovedsideData={mockHovedsideData}
        />,
      );

      expect(screen.queryByRole("button", { name: /korriger meldekort/i })).not.toBeInTheDocument();
    });

    it("skal ha riktig href med personId og periodeId", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        id: "periode-456",
        kanEndres: true,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="789"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      const knapp = screen.getByRole("button", { name: /korriger meldekort/i });
      expect(knapp).toHaveAttribute("href", "/person/789/periode/periode-456/korriger");
    });
  });

  describe("Komplett meldekort scenario", () => {
    it("skal vise alle relevante detaljer for et korrigert meldekort sendt for sent", () => {
      const periode: IRapporteringsperiode = {
        ...basePeriode,
        meldedato: "2024-01-20",
        innsendtTidspunkt: "2024-01-20T10:30:00Z",
        sisteFristForTrekk: "2024-01-17",
        originalMeldekortId: "original-123",
        kilde: {
          rolle: ROLLE.Saksbehandler,
          ident: "Z999999",
        },
        begrunnelse: "Feil i opprinnelig innsending",
        registrertArbeidssoker: true,
        kanEndres: true,
      };

      render(
        <UtvidetInfo
          periode={periode}
          personId="123"
          ansvarligSystem={ANSVARLIG_SYSTEM.DP}
          hovedsideData={mockHovedsideData}
        />,
      );

      // Skal vise alle detaljer
      expect(screen.getByText("Meldedato:")).toBeInTheDocument();
      expect(screen.getByText("Dato for korrigering:")).toBeInTheDocument();
      expect(screen.getByText("Korrigert av:")).toBeInTheDocument();
      expect(screen.getByText("Z999999")).toBeInTheDocument();
      expect(screen.getByText("Begrunnelse:")).toBeInTheDocument();
      expect(screen.getByText("Feil i opprinnelig innsending")).toBeInTheDocument();
      expect(screen.getByText("Svar på spørsmål om arbeidssøkerregistrering:")).toBeInTheDocument();
      expect(screen.getByText("Ja")).toBeInTheDocument();

      // Skal vise advarsel om for sent innsendt
      expect(screen.getByText(/dette meldekortet er sendt inn/i)).toBeInTheDocument();
      expect(screen.getByText(/etter fristen/i)).toBeInTheDocument();

      // Skal vise korriger-knapp
      expect(screen.getByRole("button", { name: /korriger meldekort/i })).toBeInTheDocument();
    });
  });
});
