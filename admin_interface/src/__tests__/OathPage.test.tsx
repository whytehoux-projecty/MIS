import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { OathPage } from "../modules/membership-initiation/pages/OathPage";
import { vi } from "vitest";
import { apiService } from "../services/apiService";

describe("OathPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  test("redirects to registration when registrationData missing", async () => {
    render(
      <MemoryRouter initialEntries={["/membership/oath"]}>
        <Routes>
          <Route path="/membership/oath" element={<OathPage />} />
          <Route
            path="/membership/registration"
            element={<div>Registration</div>}
          />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Registration/i)).toBeInTheDocument();
  });

  test("successful submission stores applicationSubmitted", async () => {
    const registrationData = {
      fullName: "John Doe",
      email: "john@example.com",
      dateOfBirth: "1990-01-01",
      phoneNumber: "+1234567890",
      addressLine1: "123 Main St",
      addressLine2: "",
      city: "Metropolis",
      state: "CA",
      postalCode: "90210",
      country: "USA",
      occupation: "Engineer",
      biography: "",
      referenceDetails: "",
      photoIds: "photo-1",
      invitationCode: "CODE123",
    };
    sessionStorage.setItem(
      "registrationData",
      JSON.stringify(registrationData)
    );
    sessionStorage.setItem(
      "validatedInvitation",
      JSON.stringify({ id: 1, code: "CODE123" })
    );

    vi.spyOn(apiService.public, "uploadAudio").mockResolvedValue({
      success: true,
      file_id: "audio-1",
      url: "https://example.com/audio-1",
      message: "ok",
    });
    vi.spyOn(apiService.public, "register").mockResolvedValue({
      success: true,
      user_id: 1,
      username: "john",
      message: "ok",
    });
    (global as any).navigator.mediaDevices = {
      getUserMedia: vi
        .fn()
        .mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    };
    (window.navigator as any).mediaDevices = (
      global as any
    ).navigator.mediaDevices;

    class FakeMediaRecorder {
      stream: any;
      ondataavailable: (e: any) => void = () => {};
      onstop: () => void = () => {};
      constructor(stream: any) {
        this.stream = stream;
      }
      start() {}
      stop() {
        setTimeout(() => {
          this.ondataavailable({
            data: new Blob(["audio"], { type: "audio/webm" }),
          });
          this.onstop();
        }, 0);
      }
    }

    (globalThis as any).MediaRecorder = FakeMediaRecorder as any;
    (window as any).MediaRecorder = FakeMediaRecorder as any;
    (globalThis as any).URL = {
      ...(globalThis as any).URL,
      createObjectURL: vi.fn(() => "blob:audio"),
    };
    (window as any).URL = {
      ...(window as any).URL,
      createObjectURL: vi.fn(() => "blob:audio"),
    };

    render(
      <MemoryRouter initialEntries={["/membership/oath"]}>
        <Routes>
          <Route path="/membership/oath" element={<OathPage />} />
          <Route
            path="/membership/submission-confirmation"
            element={<div>Submitted</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Start Recording/i }));
    await screen.findByRole("button", { name: /Stop Recording/i });
    fireEvent.click(screen.getByRole("button", { name: /Stop Recording/i }));

    const submitButton = screen.getByRole("button", { name: /Submit Oath/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    fireEvent.click(screen.getByLabelText(/General Terms/i));
    fireEvent.click(screen.getByLabelText(/Privacy Policy/i));
    fireEvent.click(screen.getByLabelText(/Code of Conduct/i));
    fireEvent.click(screen.getByLabelText(/Ethical Guidelines/i));

    fireEvent.click(screen.getByRole("button", { name: /Submit Oath/i }));
    expect(
      await screen.findByText(/Submitted/i, undefined, { timeout: 4000 })
    ).toBeInTheDocument();
    const stored = sessionStorage.getItem("applicationSubmitted");
    expect(stored).toBeTruthy();
  });
});
