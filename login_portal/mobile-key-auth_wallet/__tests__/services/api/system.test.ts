describe("systemApi", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns mock status in mock mode", async () => {
    process.env.EXPO_PUBLIC_USE_MOCK_API = "true";
    const { systemApi } = require("../../../src/services/api/system") as typeof import("../../../src/services/api/system");

    const status = await systemApi.getStatus();
    expect(status.status).toBe("open");
  });

  it("calls apiClient in non-mock mode", async () => {
    process.env.EXPO_PUBLIC_USE_MOCK_API = "false";
    const get = jest.fn().mockResolvedValue({ data: { status: "open" } });
    jest.doMock("../../../src/services/api/client", () => ({
      apiClient: { get },
    }));

    const { systemApi } = require("../../../src/services/api/system") as typeof import("../../../src/services/api/system");
    await systemApi.getStatus();
    expect(get).toHaveBeenCalled();
  });
});

