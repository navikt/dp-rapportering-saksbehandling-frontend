import groq from "groq";

export const opprettMeldekortModalQuery = groq`*[_type == "opprettMeldekortModal"][0]{
  tittel,
  fraDato {
    label,
    helpText,
    feilmelding
  },
  tilDato {
    label,
    helpText,
    feilmelding
  },
  forklaringstekst,
  submitKnapp,
  avbrytKnapp,
  meldekortoversikt {
    tittel,
    tekst,
    arsskifteTilleggstekst,
    ukenummerKolonne,
    periodeKolonne,
    varselKolonne,
    overlappAriaLabel
  },
  feilmeldinger {
    simulering {
      tittel,
      tekst
    },
    opprettelse {
      tittel,
      tekst
    },
    overlappendeMeldekort {
      tittel,
      tekst
    },
    ingenPerioder {
      tittel,
      tekst
    }
  }
}`;
