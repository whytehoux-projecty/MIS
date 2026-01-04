import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InvitationPage } from "../modules/membership-initiation/pages/InvitationPage";
test("continue disabled until terms accepted", async () => {
    render(_jsx(MemoryRouter, { children: _jsx(InvitationPage, {}) }));
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
    const checkbox = screen.getByLabelText(/I accept the terms/i);
    fireEvent.click(checkbox);
    expect(continueBtn).not.toBeDisabled();
});
