import { describe, expect, it } from "vitest";

import { deepMerge } from "./deep-merge.utils";

describe("deepMerge", () => {
  it("skal merge flate objekter", () => {
    const target = { a: 1, b: 2, c: 3 };
    const source = { b: 5, d: 4 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 5, c: 3, d: 4 });
  });

  it("skal merge nestede objekter og bevare defaults", () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: 3,
        e: 4,
      },
    };
    const source = {
      b: {
        c: 5,
      },
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      a: 1,
      b: {
        c: 5,
        d: 3,
        e: 4,
      },
    });
  });

  it("skal merge dobbelt-nestede objekter", () => {
    const target = {
      labels: {
        begrunnelse: {
          label: "Begrunnelse:",
          visMer: "Vis mer",
          visMindre: "Vis mindre",
        },
      },
    };
    const source = {
      labels: {
        begrunnelse: {
          label: "Begrunnelse (oppdatert):",
        },
      },
    };

    const result = deepMerge(target, source);

    expect(result.labels.begrunnelse).toEqual({
      label: "Begrunnelse (oppdatert):",
      visMer: "Vis mer",
      visMindre: "Vis mindre",
    });
  });

  it("skal håndtere null source", () => {
    const target = { a: 1, b: { c: 2 } };

    const result = deepMerge(target, null);

    expect(result).toEqual(target);
  });

  it("skal håndtere undefined source", () => {
    const target = { a: 1, b: { c: 2 } };

    const result = deepMerge(target, undefined);

    expect(result).toEqual(target);
  });

  it("skal håndtere tom source", () => {
    const target = { a: 1, b: { c: 2 } };

    const result = deepMerge(target, {});

    expect(result).toEqual(target);
  });

  it("skal ignorere undefined verdier i source", () => {
    const target = { a: 1, b: 2, c: 3 };
    const source = { b: undefined, d: 4 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it("skal overskrive med null verdier i source", () => {
    const target = { a: 1, b: 2, c: 3 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const source = { b: null, d: 4 } as any;

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: null, c: 3, d: 4 });
  });

  it("skal erstatte arrays, ikke merge dem", () => {
    const target = { arr: [1, 2, 3] };
    const source = { arr: [4, 5] };

    const result = deepMerge(target, source);

    expect(result.arr).toEqual([4, 5]);
  });

  it("skal erstatte Date objekter", () => {
    const targetDate = new Date("2024-01-01");
    const sourceDate = new Date("2024-12-31");
    const target = { date: targetDate };
    const source = { date: sourceDate };

    const result = deepMerge(target, source);

    expect(result.date).toBe(sourceDate);
    expect(result.date).not.toBe(targetDate);
  });

  it("skal ikke mutere originale objekter", () => {
    const target = { a: 1, b: { c: 2 } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const source = { b: { d: 3 } } as any;

    const result = deepMerge(target, source);

    expect(result).not.toBe(target);
    expect(result.b).not.toBe(target.b);
    expect(target).toEqual({ a: 1, b: { c: 2 } });
    expect(source).toEqual({ b: { d: 3 } });
  });

  it("skal merge kompleks Sanity-struktur med mange nivåer", () => {
    const defaults = {
      overskrift: "Fyll ut meldekort",
      infovarsler: {
        arenaVarsel: "Dette meldekortet er fra Arena...",
        etterregistrertVarsel: "Dette meldekortet er etterregistrert...",
      },
      utfyllingsskjema: {
        datovelgerLabel: "Sett meldedato",
        arbeidssoekerSpoersmaal: {
          tittel: "Registrert som arbeidssøker?",
          ja: "Ja",
          nei: "Nei",
        },
      },
    };

    const sanityData = {
      overskrift: "Fyll ut meldekort (oppdatert)",
      infovarsler: {
        arenaVarsel: "Oppdatert tekst fra Sanity",
      },
      utfyllingsskjema: {
        arbeidssoekerSpoersmaal: {
          tittel: "Skal bruker være registrert?",
        },
      },
    };

    const result = deepMerge(defaults, sanityData);

    expect(result).toEqual({
      overskrift: "Fyll ut meldekort (oppdatert)",
      infovarsler: {
        arenaVarsel: "Oppdatert tekst fra Sanity",
        etterregistrertVarsel: "Dette meldekortet er etterregistrert...",
      },
      utfyllingsskjema: {
        datovelgerLabel: "Sett meldedato",
        arbeidssoekerSpoersmaal: {
          tittel: "Skal bruker være registrert?",
          ja: "Ja",
          nei: "Nei",
        },
      },
    });
  });

  it("skal merge dypt nestede strukturer", () => {
    const defaults = {
      gjeldendeMeldekort: {
        overskrift: "Korrigering av følgende meldekort",
        innsendtDato: "Meldekortet ble innsendt {{dato}}",
        begrunnelseOverskrift: {
          korrigering: "Begrunnelse for korrigering",
          manuellInnsending: "Begrunnelse for innsending",
        },
      },
    };

    const sanityData = {
      gjeldendeMeldekort: {
        overskrift: "Korrigering (oppdatert)",
      },
    };

    const result = deepMerge(defaults, sanityData);

    expect(result.gjeldendeMeldekort).toEqual({
      overskrift: "Korrigering (oppdatert)",
      innsendtDato: "Meldekortet ble innsendt {{dato}}",
      begrunnelseOverskrift: {
        korrigering: "Begrunnelse for korrigering",
        manuellInnsending: "Begrunnelse for innsending",
      },
    });
  });

  it("skal merge mange nivåer av nesting", () => {
    const target = {
      level1: {
        level2: {
          level3: {
            level4: {
              value: "deep",
            },
          },
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const source: any = {
      level1: {
        level2: {
          level3: {
            newProp: "added",
          },
        },
      },
    };

    const result = deepMerge(target, source);

    expect(result.level1.level2.level3).toEqual({
      level4: { value: "deep" },
      newProp: "added",
    });
  });
});
