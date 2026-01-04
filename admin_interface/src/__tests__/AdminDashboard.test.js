import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
test("renders Admin Dashboard header", async () => {
    render(_jsx(MemoryRouter, { children: _jsx(AdminDashboard, {}) }));
    expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
});
