import { describe, expect, it } from "vitest";

import { sanityDataMangler } from "./utils";

describe("sanityDataMangler", () => {
  describe("når data er null eller undefined", () => {
    it("skal returnere true når data er null", () => {
      expect(sanityDataMangler(null)).toBe(true);
    });

    it("skal returnere true når data er undefined", () => {
      expect(sanityDataMangler(undefined)).toBe(true);
    });
  });

  describe("når ingen required fields er spesifisert", () => {
    it("skal returnere false når data finnes", () => {
      const data = { field1: "value", field2: "value" };
      expect(sanityDataMangler(data)).toBe(false);
    });

    it("skal returnere false når data er tomt objekt", () => {
      expect(sanityDataMangler({})).toBe(false);
    });
  });

  describe("når required fields er spesifisert", () => {
    it("skal returnere false når alle required fields har verdier", () => {
      const data = { name: "Test", title: "Title", description: "Description" };
      expect(sanityDataMangler(data, ["name", "title"])).toBe(false);
    });

    it("skal returnere true når et required field er null", () => {
      const data = { name: "Test", title: null };
      expect(sanityDataMangler(data, ["name", "title"])).toBe(true);
    });

    it("skal returnere true når et required field er undefined", () => {
      const data = { name: "Test", title: undefined };
      expect(sanityDataMangler(data, ["name", "title"])).toBe(true);
    });

    it("skal returnere true når et required field er tom streng", () => {
      const data = { name: "Test", title: "" };
      expect(sanityDataMangler(data, ["name", "title"])).toBe(true);
    });

    it("skal returnere true når et required field er tomt array", () => {
      const data = { name: "Test", items: [] };
      expect(sanityDataMangler(data, ["name", "items"])).toBe(true);
    });

    it("skal returnere false når required field er array med elementer", () => {
      const data = { name: "Test", items: ["item1", "item2"] };
      expect(sanityDataMangler(data, ["name", "items"])).toBe(false);
    });

    it("skal returnere false når required field er tall 0", () => {
      const data = { name: "Test", count: 0 };
      expect(sanityDataMangler(data, ["name", "count"])).toBe(false);
    });

    it("skal returnere false når required field er boolean false", () => {
      const data = { name: "Test", enabled: false };
      expect(sanityDataMangler(data, ["name", "enabled"])).toBe(false);
    });
  });

  describe("med flere required fields", () => {
    it("skal returnere true hvis ett av flere required fields mangler", () => {
      const data = { field1: "value", field2: "", field3: "value" };
      expect(sanityDataMangler(data, ["field1", "field2", "field3"])).toBe(true);
    });

    it("skal returnere true hvis siste required field mangler", () => {
      const data = { field1: "value", field2: "value", field3: null };
      expect(sanityDataMangler(data, ["field1", "field2", "field3"])).toBe(true);
    });

    it("skal returnere true hvis første required field mangler", () => {
      const data = { field1: undefined, field2: "value", field3: "value" };
      expect(sanityDataMangler(data, ["field1", "field2", "field3"])).toBe(true);
    });

    it("skal returnere false hvis alle required fields har verdier", () => {
      const data = { field1: "value1", field2: "value2", field3: "value3" };
      expect(sanityDataMangler(data, ["field1", "field2", "field3"])).toBe(false);
    });
  });

  describe("med komplekse datatyper", () => {
    it("skal returnere false når required field er objekt", () => {
      const data = { name: "Test", config: { key: "value" } };
      expect(sanityDataMangler(data, ["name", "config"])).toBe(false);
    });

    it("skal returnere false når required field er tomt objekt", () => {
      const data = { name: "Test", config: {} };
      expect(sanityDataMangler(data, ["name", "config"])).toBe(false);
    });

    it("skal håndtere nested objects i data", () => {
      const data = { name: "Test", nested: { deep: { value: "test" } } };
      expect(sanityDataMangler(data, ["name", "nested"])).toBe(false);
    });
  });
});
