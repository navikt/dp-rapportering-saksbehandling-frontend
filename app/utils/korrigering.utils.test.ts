import { describe, expect, it } from "vitest";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { erIkkeAktiv } from "~/utils/korrigering.utils";
import type { TAktivitetType } from "~/utils/types";

describe("erIkkeAktiv", () => {
  it("skal returnere false hvis aktivitet er Syk og aktiviteter inneholder både Syk og Arbeid", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Syk, AKTIVITET_TYPE.Arbeid];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Syk);

    expect(result).toBe(false);
  });

  it("skal returnere false hvis aktivitet er Fravaer og aktiviteter inneholder både Fravaer og Arbeid", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Fravaer, AKTIVITET_TYPE.Arbeid];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Fravaer);

    expect(result).toBe(false);
  });

  it("skal returnere true hvis aktivitet er Arbeid og aktiviteter inneholder Syk", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Syk];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid);

    expect(result).toBe(true);
  });

  it("skal returnere true hvis aktivitet er Arbeid og aktiviteter inneholder Fravaer", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Fravaer];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid);

    expect(result).toBe(true);
  });

  it("skal returnere true hvis aktivitet er Syk og aktiviteter inneholder Arbeid", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Arbeid];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Syk);

    expect(result).toBe(true);
  });

  it("skal returnere true hvis aktivitet er Fravaer og aktiviteter inneholder Arbeid", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Arbeid];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Fravaer);

    expect(result).toBe(true);
  });

  it("skal returnere false hvis aktivitet er Utdanning og aktiviteter inneholder Arbeid", () => {
    const aktiviteter: TAktivitetType[] = [AKTIVITET_TYPE.Arbeid];
    const result = erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Utdanning);

    expect(result).toBe(false);
  });
});
