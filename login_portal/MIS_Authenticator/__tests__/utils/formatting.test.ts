import { formatPin } from "@/utils/formatting";

describe("formatPin", () => {
  it("returns digits only", () => {
    expect(formatPin("12-34 56")).toBe("123456");
  });

  it("returns dash for empty pin", () => {
    expect(formatPin("")).toBe("—");
  });
});

