import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Valideringsfeil from "~/components/valideringsfeil/Valideringsfeil";

const feilmeldinger = {
  meldedato: "string",
  arbeidssoker: "string",
  begrunnelse: "string",
  ingenEndringer: "Melding ingenEndringer",
  duplikateAktivitetstyper: "Melding duplikateAktivitetstyper",
  ugyldigAktivitetskombinasjon: "Melding ugyldigAktivitetskombinasjon",
  ugyldigeTimer: "Melding ugyldigeTimer",
};

describe("Valideringsfeil", () => {
  it("skal ikke vise Valideringsfeil uten feil", () => {
    const skjema = {
      state: {
        visValideringsfeil: {
          meldedato: false,
          arbeidssoker: false,
          begrunnelse: false,
          aktiviteter: null,
          endringer: false,
        },
      },
      feilmeldinger: feilmeldinger,
    };

    render(<Valideringsfeil skjema={skjema} />);

    expect(screen.queryByText(/Melding ingenEndringer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding duplikateAktivitetstyper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigAktivitetskombinasjon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigeTimer/i)).not.toBeInTheDocument();
  });

  it("skal vise Valideringsfeil hvis det ikke finnes endringer", () => {
    const skjema = {
      state: {
        visValideringsfeil: {
          meldedato: false,
          arbeidssoker: false,
          begrunnelse: false,
          aktiviteter: null,
          endringer: true,
        },
      },
      feilmeldinger: feilmeldinger,
    };

    render(<Valideringsfeil skjema={skjema} />);

    expect(screen.queryByText(/Melding ingenEndringer/i)).toBeInTheDocument();
    expect(screen.queryByText(/Melding duplikateAktivitetstyper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigAktivitetskombinasjon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigeTimer/i)).not.toBeInTheDocument();
  });

  it("skal vise Valideringsfeil hvis det finnes duplikater i aktiviteter", () => {
    const aktiviteter = new Map();
    aktiviteter.set("2026-01-01", ["duplikateAktivitetstyper"]);

    const skjema = {
      state: {
        visValideringsfeil: {
          meldedato: false,
          arbeidssoker: false,
          begrunnelse: false,
          aktiviteter: aktiviteter,
          endringer: false,
        },
      },
      feilmeldinger: feilmeldinger,
    };

    render(<Valideringsfeil skjema={skjema} />);

    expect(screen.queryByText(/Melding ingenEndringer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding duplikateAktivitetstyper/i)).toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigAktivitetskombinasjon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigeTimer/i)).not.toBeInTheDocument();
  });

  it("skal vise Valideringsfeil hvis det finnes ugyldige aktivitetskombinasjoner", () => {
    const aktiviteter = new Map();
    aktiviteter.set("2026-01-01", ["ugyldigAktivitetskombinasjon"]);

    const skjema = {
      state: {
        visValideringsfeil: {
          meldedato: false,
          arbeidssoker: false,
          begrunnelse: false,
          aktiviteter: aktiviteter,
          endringer: false,
        },
      },
      feilmeldinger: feilmeldinger,
    };

    render(<Valideringsfeil skjema={skjema} />);

    expect(screen.queryByText(/Melding ingenEndringer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding duplikateAktivitetstyper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigAktivitetskombinasjon/i)).toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigeTimer/i)).not.toBeInTheDocument();
  });

  it("skal vise Valideringsfeil hvis det finnes ugyldige timer", () => {
    const aktiviteter = new Map();
    aktiviteter.set("2026-01-01", ["ugyldigeTimer"]);

    const skjema = {
      state: {
        visValideringsfeil: {
          meldedato: false,
          arbeidssoker: false,
          begrunnelse: false,
          aktiviteter: aktiviteter,
          endringer: false,
        },
      },
      feilmeldinger: feilmeldinger,
    };

    render(<Valideringsfeil skjema={skjema} />);

    expect(screen.queryByText(/Melding ingenEndringer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding duplikateAktivitetstyper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigAktivitetskombinasjon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Melding ugyldigeTimer/i)).toBeInTheDocument();
  });
});
