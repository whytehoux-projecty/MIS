import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import ResultScreen from "../../app/(auth)/result";

describe("ResultScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("copies PIN to clipboard", async () => {
    (useLocalSearchParams as unknown as jest.Mock).mockReturnValue({
      pin: "123456",
      expiresIn: "300",
      serviceName: "Test Service",
    });

    const { getByText, unmount } = render(<ResultScreen />);
    fireEvent.press(getByText("Copy"));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith("123456");
    unmount();
  });
});
