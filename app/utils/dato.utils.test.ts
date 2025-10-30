import { describe, expect, it } from "vitest";

import { groupByYear, sortYearsDescending } from "./dato.utils";

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
