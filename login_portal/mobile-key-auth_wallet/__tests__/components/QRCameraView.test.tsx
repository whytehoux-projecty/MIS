import { fireEvent, render } from "@testing-library/react-native";
import { QRCameraView } from "@/components/scanner/QRCameraView";

describe("QRCameraView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows permission prompt when not granted", () => {
    const expoCamera = require("expo-camera") as {
      useCameraPermissions: jest.Mock;
    };
    const requestPermission = jest.fn();
    expoCamera.useCameraPermissions.mockReturnValue([{ granted: false }, requestPermission]);

    const onCancel = jest.fn();
    const onScan = jest.fn();

    const { getByText } = render(<QRCameraView onCancel={onCancel} onScan={onScan} />);

    fireEvent.press(getByText("Grant Permission"));
    expect(requestPermission).toHaveBeenCalled();
  });

  it("calls onCancel from permission screen", () => {
    const expoCamera = require("expo-camera") as {
      useCameraPermissions: jest.Mock;
    };
    expoCamera.useCameraPermissions.mockReturnValue([{ granted: false }, jest.fn()]);

    const onCancel = jest.fn();
    const onScan = jest.fn();

    const { getByText } = render(<QRCameraView onCancel={onCancel} onScan={onScan} />);
    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});

