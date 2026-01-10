import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";
import LinkAccountScreen from "../../app/(onboarding)/link-account";

jest.mock("@/services/api", () => ({
  authApi: {
    validateKey: jest.fn(),
  },
}));

describe("LinkAccountScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("navigates to tabs home on success", async () => {
    const { authApi } = require("@/services/api") as {
      authApi: { validateKey: jest.Mock };
    };

    authApi.validateKey.mockResolvedValue({
      valid: true,
      user: { id: 1, username: "u", full_name: "U", email: "e" },
    });

    const { getByPlaceholderText, getByText } = render(<LinkAccountScreen />);
    fireEvent.changeText(getByPlaceholderText("xxxx-xxxx-xxxx-xxxx"), "test-key");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/(auth)/(tabs)/home");
    });
  });
});

