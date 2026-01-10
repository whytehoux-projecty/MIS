import { normalizeAuthKey } from "@/utils/validation";

describe("normalizeAuthKey", () => {
  it("removes whitespace", () => {
    expect(normalizeAuthKey("  ab cd \n ef  ")).toBe("abcdef");
  });

  it("returns empty string for blank input", () => {
    expect(normalizeAuthKey("   ")).toBe("");
  });
});

