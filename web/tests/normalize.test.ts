import { describe, expect, it } from "vitest";
import { normalizeOrganization, slugifyOrganization, tokenizeQuery } from "../lib/normalize";

describe("normalizeOrganization", () => {
  it("handles null, undefined, and empty string", () => {
    expect(normalizeOrganization(null)).toBe("");
    expect(normalizeOrganization(undefined)).toBe("");
    expect(normalizeOrganization("   ")).toBe("");
  });

  it("lowercases and collapses whitespace", () => {
    expect(normalizeOrganization("  Indian   Institute of Technology  ")).toBe("indian institute of technology");
  });

  it("normalizes smart quotes and hyphens", () => {
    expect(normalizeOrganization("St. John’s College – Engineering")).toBe("st. john's college - engineering");
  });

  it("strips trailing punctuation", () => {
    expect(normalizeOrganization("IIT Bombay.")).toBe("iit bombay");
    expect(normalizeOrganization("BITS Pilani,")).toBe("bits pilani");
  });
});

describe("slugifyOrganization", () => {
  it("converts names to url-friendly slugs", () => {
    expect(slugifyOrganization("Indian Institute of Technology (IIT), Madras")).toBe("indian-institute-of-technology-iit-madras");
    expect(slugifyOrganization("Vellore Institute of Technology (VIT)")).toBe("vellore-institute-of-technology-vit");
  });
});

describe("tokenizeQuery", () => {
  it("splits query into tokens", () => {
    expect(tokenizeQuery("IIT Bombay")).toEqual(["iit", "bombay"]);
    expect(tokenizeQuery("BITS, Pilani (Goa)")).toEqual(["bits", "pilani", "goa"]);
  });
});
