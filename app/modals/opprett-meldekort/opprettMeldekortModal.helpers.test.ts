import { describe, expect, it } from "vitest";

import {
  buildOpprettMeldekortFormData,
  erSammePeriode,
  harPeriodeMedArsskifte,
  interpolerAntallIPortableText,
  toOpprettMeldekortErrorMessage,
  utledGyldigPeriode,
} from "./opprettMeldekortModal.helpers";

describe("opprettMeldekortModal.helpers", () => {
  it("bygger formdata med simulering", () => {
    const formData = buildOpprettMeldekortFormData({
      personId: "123",
      fraOgMed: "2025-01-06",
      tilOgMed: "2025-01-19",
      simulering: true,
    });

    expect(Object.fromEntries(formData)).toEqual({
      personId: "123",
      fraOgMed: "2025-01-06",
      tilOgMed: "2025-01-19",
      simulering: "true",
    });
  });

  it("returnerer gyldig periode for et gyldig datointervall", () => {
    expect(
      utledGyldigPeriode({
        from: new Date("2025-01-06"),
        to: new Date("2025-01-19"),
      }),
    ).toEqual({ fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" });
  });

  it("avviser manglende, omvendt og fremtidig datointervall", () => {
    expect(utledGyldigPeriode(undefined)).toBeNull();
    expect(
      utledGyldigPeriode({ from: new Date("2025-01-19"), to: new Date("2025-01-06") }),
    ).toBeNull();
    expect(
      utledGyldigPeriode({ from: new Date("2999-01-06"), to: new Date("2999-01-19") }),
    ).toBeNull();
  });

  it("sammenligner periodeintervaller", () => {
    const periode = { fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" };

    expect(erSammePeriode(periode, { ...periode })).toBe(true);
    expect(erSammePeriode(periode, null)).toBe(false);
    expect(erSammePeriode(periode, { fraOgMed: "2025-01-06", tilOgMed: "2025-01-20" })).toBe(false);
  });

  it("lager feilmelding med og uten detalj", () => {
    expect(toOpprettMeldekortErrorMessage({ error: "Feil", detail: "Detalj" })).toBe(
      "Feil: Detalj",
    );
    expect(toOpprettMeldekortErrorMessage({})).toBe("Kunne ikke opprette meldekort.");
  });

  it("interpolerer antall i portable text og bevarer marks", () => {
    const blocks = interpolerAntallIPortableText(
      [
        {
          _type: "block",
          _key: "b1",
          style: "normal",
          markDefs: [],
          children: [
            { _type: "span", _key: "s1", text: "Opprett ", marks: [] },
            { _type: "span", _key: "s2", text: "{{antall}}", marks: ["strong"] },
            { _type: "span", _key: "s3", text: " meldekort", marks: [] },
          ],
        },
      ],
      3,
    );

    expect(blocks[0].children).toEqual([
      { _type: "span", _key: "s1", text: "Opprett ", marks: [] },
      { _type: "span", _key: "s2", text: "3", marks: ["strong"] },
      { _type: "span", _key: "s3", text: " meldekort", marks: [] },
    ]);
  });

  it("oppdager periode som krysser årsskifte", () => {
    expect(harPeriodeMedArsskifte([{ fraOgMed: "2024-12-30", tilOgMed: "2025-01-12" }])).toBe(true);
    expect(harPeriodeMedArsskifte([{ fraOgMed: "2025-01-06", tilOgMed: "2025-01-19" }])).toBe(
      false,
    );
  });
});
