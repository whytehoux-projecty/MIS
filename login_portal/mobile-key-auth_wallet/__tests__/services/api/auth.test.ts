describe("authApi", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns mock user on valid key in mock mode", async () => {
    process.env.EXPO_PUBLIC_USE_MOCK_API = "true";
    const { authApi } = require("../../../src/services/api/auth") as typeof import("../../../src/services/api/auth");

    const result = await authApi.validateKey("good-key-1234");
    expect(result.valid).toBe(true);
    expect(result.user?.username).toBe("demo");
  });

  it("returns USER_NOT_FOUND on bad key in mock mode", async () => {
    process.env.EXPO_PUBLIC_USE_MOCK_API = "true";
    const { authApi } = require("../../../src/services/api/auth") as typeof import("../../../src/services/api/auth");

    const result = await authApi.validateKey("bad-key-1234");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("USER_NOT_FOUND");
  });

  it("calls apiClient in non-mock mode", async () => {
    process.env.EXPO_PUBLIC_USE_MOCK_API = "false";
    const post = jest.fn().mockResolvedValue({ data: { valid: true } });
    jest.doMock("../../../src/services/api/client", () => ({
      apiClient: { post },
    }));

    const { authApi } = require("../../../src/services/api/auth") as typeof import("../../../src/services/api/auth");
    await authApi.validateKey("real-key-1234");
    expect(post).toHaveBeenCalled();
  });
});

