import { describe, expect, it } from "vitest";

import { byggFulltNavn } from "./person.utils";

describe("byggFulltNavn", () => {
  it("skal bygge fullt navn med fornavn, mellomnavn og etternavn", () => {
    const fulltNavn = byggFulltNavn("Ola", "Mellomnavn", "Nordmann");
    expect(fulltNavn).toBe("Ola Mellomnavn Nordmann");
  });

  it("skal håndtere manglende mellomnavn (null)", () => {
    const fulltNavn = byggFulltNavn("Ola", null, "Nordmann");
    expect(fulltNavn).toBe("Ola Nordmann");
  });

  it("skal håndtere manglende mellomnavn (undefined)", () => {
    const fulltNavn = byggFulltNavn("Ola", undefined, "Nordmann");
    expect(fulltNavn).toBe("Ola Nordmann");
  });

  it("skal håndtere tomt mellomnavn (tom streng)", () => {
    const fulltNavn = byggFulltNavn("Ola", "", "Nordmann");
    expect(fulltNavn).toBe("Ola Nordmann");
  });
});
