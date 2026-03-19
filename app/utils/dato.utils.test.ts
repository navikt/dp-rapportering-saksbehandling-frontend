import { describe, expect, it } from "vitest";

import {
  groupByYear,
  konverterFraISO8601Varighet,
  konverterTilISO8601Varighet,
  konverterTilNumber,
  sortYearsDescending,
} from "./dato.utils";

describe("groupByYear", () => {
  it("skal gruppere objekter etter år basert på dato", () => {
    const items = [
      { id: 1, dato: new Date("2024-01-15") },
      { id: 2, dato: new Date("2024-06-20") },
      { id: 3, dato: new Date("2023-12-01") },
      { id: 4, dato: new Date("2023-03-10") },
    ];

    const result = groupByYear(items, (item) => item.dato);

    expect(result[2024]).toHaveLength(2);
    expect(result[2024][0].id).toBe(1);
    expect(result[2024][1].id).toBe(2);
    expect(result[2023]).toHaveLength(2);
    expect(result[2023][0].id).toBe(3);
    expect(result[2023][1].id).toBe(4);
  });

  it("skal håndtere tom array", () => {
    const result = groupByYear([], () => new Date());

    expect(result).toEqual({});
  });

  it("skal håndtere items med samme år", () => {
    const items = [
      { id: 1, dato: new Date("2024-01-01") },
      { id: 2, dato: new Date("2024-12-31") },
    ];

    const result = groupByYear(items, (item) => item.dato);

    expect(result[2024]).toHaveLength(2);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it("skal fungere med ulike dato-typer", () => {
    interface EventWithStringDate {
      id: number;
      dateString: string;
    }

    const items: EventWithStringDate[] = [
      { id: 1, dateString: "2024-05-20" },
      { id: 2, dateString: "2023-08-15" },
    ];

    const result = groupByYear(items, (item) => new Date(item.dateString));

    expect(result[2024]).toHaveLength(1);
    expect(result[2023]).toHaveLength(1);
  });

  it("skal bevare rekkefølge innad i hvert år", () => {
    const items = [
      { id: 1, dato: new Date("2024-01-01") },
      { id: 2, dato: new Date("2024-06-01") },
      { id: 3, dato: new Date("2024-12-01") },
    ];

    const result = groupByYear(items, (item) => item.dato);

    expect(result[2024][0].id).toBe(1);
    expect(result[2024][1].id).toBe(2);
    expect(result[2024][2].id).toBe(3);
  });
});

describe("sortYearsDescending", () => {
  it("skal sortere år i synkende rekkefølge", () => {
    const grouped = {
      2022: [1, 2],
      2024: [3, 4],
      2023: [5, 6],
    };

    const result = sortYearsDescending(grouped);

    expect(result).toEqual([2024, 2023, 2022]);
  });

  it("skal håndtere enkelt år", () => {
    const grouped = {
      2024: [1],
    };

    const result = sortYearsDescending(grouped);

    expect(result).toEqual([2024]);
  });

  it("skal håndtere tomt objekt", () => {
    const grouped = {};

    const result = sortYearsDescending(grouped);

    expect(result).toEqual([]);
  });

  it("skal håndtere år langt tilbake i tid", () => {
    const grouped = {
      2024: [1],
      2020: [2],
      2015: [3],
      2010: [4],
    };

    const result = sortYearsDescending(grouped);

    expect(result).toEqual([2024, 2020, 2015, 2010]);
  });
});

describe("konverterTilNumber", () => {
  it("skal returnere null hvis string er null", () => {
    const result = konverterTilNumber(null);

    expect(result).toBe(null);
  });

  it("skal returnere null hvis string er undefined", () => {
    const result = konverterTilNumber(undefined);

    expect(result).toBe(null);
  });

  it("skal returnere null hvis string er tom", () => {
    const result = konverterTilNumber("");

    expect(result).toBe(null);
  });

  it("skal returnere null hvis string inneholder kun mellomrom", () => {
    const result = konverterTilNumber("   ");

    expect(result).toBe(null);
  });

  it("skal returnere 0 hvis string er 0", () => {
    const result = konverterTilNumber("0");

    expect(result).toBe(0);
  });

  it("skal returnere tall hvis string er heltall", () => {
    const result = konverterTilNumber("7");

    expect(result).toBe(7);
  });

  it("skal returnere tall hvis string er desimaltall med prikk som skilletegn", () => {
    const result = konverterTilNumber("0.5");

    expect(result).toBe(0.5);
  });

  it("skal returnere tall hvis string er desimaltall med komma som skilletegn", () => {
    const result = konverterTilNumber("0,5");

    expect(result).toBe(0.5);
  });
});

describe("konverterTilISO8601Varighet", () => {
  it("skal returnere null hvis tid er null", () => {
    const result = konverterTilISO8601Varighet(null);

    expect(result).toBe(null);
  });

  it("skal returnere null hvis tid er undefined", () => {
    const result = konverterTilISO8601Varighet(undefined);

    expect(result).toBe(null);
  });

  it("skal returnere null hvis tid er tom", () => {
    const result = konverterTilISO8601Varighet("");

    expect(result).toBe(null);
  });

  it("skal returnere null hvis tid inneholder kun mellomrom", () => {
    const result = konverterTilISO8601Varighet("   ");

    expect(result).toBe(null);
  });

  it("skal returnere varighet hvis tid er 0", () => {
    const result = konverterTilISO8601Varighet("0");

    expect(result).toBe("PT0H");
  });

  it("skal returnere varighet hvis tid er heltall", () => {
    const result = konverterTilISO8601Varighet("7");

    expect(result).toBe("PT7H");
  });

  it("skal returnere varighet hvis tid er desimaltall med prikk som skilletegn", () => {
    const result = konverterTilISO8601Varighet("0.5");

    expect(result).toBe("PT0H30M");
  });

  it("skal returnere varighet hvis tid er desimaltall med komma som skilletegn", () => {
    const result = konverterTilISO8601Varighet("0,5");

    expect(result).toBe("PT0H30M");
  });
});

describe("konverterFraISO8601Varighet", () => {
  it("skal returnere null hvis varighet er null", () => {
    const result = konverterFraISO8601Varighet(null);

    expect(result).toBe(null);
  });

  it("skal returnere null hvis varighet er undefined", () => {
    const result = konverterFraISO8601Varighet(undefined);

    expect(result).toBe(null);
  });

  it("skal returnere null hvis varighet er tom", () => {
    const result = konverterFraISO8601Varighet("");

    expect(result).toBe(null);
  });

  it("skal returnere null hvis varighet inneholder kun mellomrom", () => {
    const result = konverterFraISO8601Varighet("   ");

    expect(result).toBe(null);
  });

  it("skal returnere 0 hvis varighet er PT0H", () => {
    const result = konverterFraISO8601Varighet("PT0H");

    expect(result).toBe(0);
  });

  it("skal returnere tid hvis varighet har kun timer", () => {
    const result = konverterFraISO8601Varighet("PT7H");

    expect(result).toBe(7);
  });

  it("skal returnere tid hvis varighet har kun minutter", () => {
    const result = konverterFraISO8601Varighet("PT30M");

    expect(result).toBe(0.5);
  });

  it("skal returnere tid hvis varighet har både timer og minutter", () => {
    const result = konverterFraISO8601Varighet("PT4H30M");

    expect(result).toBe(4.5);
  });
});
