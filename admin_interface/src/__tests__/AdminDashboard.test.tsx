import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminDashboard } from "../pages/admin/AdminDashboard";

test("renders Admin Dashboard header", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
});
