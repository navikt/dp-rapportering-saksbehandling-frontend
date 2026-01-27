import { describe, expect, it } from "vitest";

import { sanityClient } from "./client";

describe("sanityClient", () => {
  it("skal være konfigurert med riktig projectId", () => {
    expect(sanityClient.config().projectId).toBe("rt6o382n");
  });

  it("skal være konfigurert med apiVersion", () => {
    expect(sanityClient.config().apiVersion).toBe("2022-03-07");
  });

  it("skal ha useCdn satt til true", () => {
    expect(sanityClient.config().useCdn).toBe(true);
  });

  it("skal bruke dataset fra env", () => {
    const dataset = sanityClient.config().dataset;
    expect(dataset).toBeTruthy();
    expect(typeof dataset).toBe("string");
  });
});
