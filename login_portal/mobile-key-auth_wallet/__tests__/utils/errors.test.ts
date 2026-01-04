import { getUserFriendlyError } from "@/utils/errors";

describe("getUserFriendlyError", () => {
  it("maps known codes", () => {
    expect(getUserFriendlyError("QR_EXPIRED")).toBe(
      "This QR code has expired. Please request a new one."
    );
  });

  it("trims and returns unknown strings", () => {
    expect(getUserFriendlyError("  Something else  ")).toBe("Something else");
  });

  it("returns default message for empty input", () => {
    expect(getUserFriendlyError("   ")).toBe("Something went wrong. Please try again.");
  });
});

