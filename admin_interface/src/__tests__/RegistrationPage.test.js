import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RegistrationPage } from "../modules/membership-initiation/pages/RegistrationPage";
describe("RegistrationPage", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });
    test("renders header and time remaining when session is valid", async () => {
        const invitationData = {
            code: "CODE123",
            id: 1,
            intendedFor: "John Doe",
        };
        const startTime = Math.floor(Date.now() / 1000);
        sessionStorage.setItem("validatedInvitation", JSON.stringify(invitationData));
        sessionStorage.setItem("invitationSessionStart", startTime.toString());
        render(_jsx(MemoryRouter, { initialEntries: ["/membership/registration"], children: _jsx(RegistrationPage, {}) }));
        expect(await screen.findByText(/Complete Your Registration/i)).toBeInTheDocument();
        expect(await screen.findByText(/Time Remaining:/i)).toBeInTheDocument();
    });
    test("shows photo validation error when submitting without photos", async () => {
        const invitationData = { id: 1, code: "CODE123" };
        const startTime = Math.floor(Date.now() / 1000);
        sessionStorage.setItem("validatedInvitation", JSON.stringify(invitationData));
        sessionStorage.setItem("invitationSessionStart", startTime.toString());
        render(_jsx(MemoryRouter, { children: _jsx(RegistrationPage, {}) }));
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "+1234567890" } });
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: "1990-01-01" } });
        fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: "Engineer" } });
        fireEvent.change(screen.getByLabelText(/Address Line 1/i), { target: { value: "123 Main St" } });
        fireEvent.change(screen.getByLabelText(/City/i), { target: { value: "Metropolis" } });
        fireEvent.change(screen.getByLabelText(/State\/Province/i), { target: { value: "CA" } });
        fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: "90210" } });
        fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: "USA" } });
        fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
        expect(await screen.findByText(/Please upload at least one profile photo/i)).toBeInTheDocument();
    });
});
