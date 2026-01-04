import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        render(_jsx(MemoryRouter, { initialEntries: ["/membership/oath"], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/membership/oath", element: _jsx(OathPage, {}) }), _jsx(Route, { path: "/membership/registration", element: _jsx("div", { children: "Registration" }) })] }) }));
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
        sessionStorage.setItem("registrationData", JSON.stringify(registrationData));
        sessionStorage.setItem("validatedInvitation", JSON.stringify({ id: 1, code: "CODE123" }));
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
        global.navigator.mediaDevices = {
            getUserMedia: vi
                .fn()
                .mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
        };
        window.navigator.mediaDevices = global.navigator.mediaDevices;
        class FakeMediaRecorder {
            constructor(stream) {
                this.ondataavailable = () => { };
                this.onstop = () => { };
                this.stream = stream;
            }
            start() { }
            stop() {
                setTimeout(() => {
                    this.ondataavailable({
                        data: new Blob(["audio"], { type: "audio/webm" }),
                    });
                    this.onstop();
                }, 0);
            }
        }
        globalThis.MediaRecorder = FakeMediaRecorder;
        window.MediaRecorder = FakeMediaRecorder;
        globalThis.URL = {
            ...globalThis.URL,
            createObjectURL: vi.fn(() => "blob:audio"),
        };
        window.URL = {
            ...window.URL,
            createObjectURL: vi.fn(() => "blob:audio"),
        };
        render(_jsx(MemoryRouter, { initialEntries: ["/membership/oath"], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/membership/oath", element: _jsx(OathPage, {}) }), _jsx(Route, { path: "/membership/submission-confirmation", element: _jsx("div", { children: "Submitted" }) })] }) }));
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
        expect(await screen.findByText(/Submitted/i, undefined, { timeout: 4000 })).toBeInTheDocument();
        const stored = sessionStorage.getItem("applicationSubmitted");
        expect(stored).toBeTruthy();
    });
});
