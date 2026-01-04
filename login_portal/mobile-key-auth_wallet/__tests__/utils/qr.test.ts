import { extractQrToken } from "@/utils/qr";

describe("extractQrToken", () => {
  it("extracts qr_token from URL query", () => {
    expect(extractQrToken("https://example.com/login?qr_token=abc123")).toBe("abc123");
  });

  it("extracts token from URL query", () => {
    expect(extractQrToken("https://example.com/login?token=zzz")).toBe("zzz");
  });

  it("accepts uuid-like raw tokens", () => {
    expect(extractQrToken("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );
  });

  it("returns null for invalid input", () => {
    expect(extractQrToken("not a token")).toBeNull();
  });
});

