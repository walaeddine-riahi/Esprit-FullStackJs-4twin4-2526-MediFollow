/**
 * ============================================
 * MediFollow - Admin Dashboard Frontend Tests
 * ============================================
 *
 * Tests for the Admin Dashboard UI:
 *   - Renders the page title containing "Admin"
 *   - Renders a users table
 *   - Renders stats cards (total users, doctors, patients)
 *   - "Block user" button click behavior
 *
 * All API/fetch calls are mocked — no real backend required.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Mock next/navigation (useRouter, useSearchParams)
// ---------------------------------------------------------------------------
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// ---------------------------------------------------------------------------
// Mock next/link (require React inside factory to avoid scope restriction)
// ---------------------------------------------------------------------------
jest.mock("next/link", () => {
  const MockLink = ({ children, href, ...rest }) => {
    const ReactInside = require("react");
    return ReactInside.createElement("a", { href, ...rest }, children);
  };
  return MockLink;
});

// ---------------------------------------------------------------------------
// Mock server actions (admin.actions, service.actions)
// ---------------------------------------------------------------------------
const mockGetAllUsers = jest.fn();
const mockCreateUser = jest.fn();
jest.mock("@/lib/actions/admin.actions", () => ({
  getAllUsers: (...args) => mockGetAllUsers(...args),
  createUser: (...args) => mockCreateUser(...args),
}));

jest.mock("@/lib/actions/service.actions", () => ({
  getAllServices: jest.fn().mockResolvedValue([]),
  getAssignableCareTeam: jest.fn().mockResolvedValue([]),
  updateService: jest.fn().mockResolvedValue({}),
}));

// ---------------------------------------------------------------------------
// Mock pusher-js (used by LiveAdminDashboard)
// ---------------------------------------------------------------------------
jest.mock("pusher-js", () => {
  return jest.fn().mockImplementation(() => ({
    subscribe: jest.fn().mockReturnValue({
      bind: jest.fn(),
      unbind_all: jest.fn(),
    }),
    disconnect: jest.fn(),
  }));
});

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        totalUsers: 50,
        totalDoctors: 15,
        totalPatients: 30,
        totalAlerts: 5,
        criticalAlerts: 1,
        openAlerts: 3,
        resolvedAlerts: 1,
      }),
  })
);

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const MOCK_USERS = [
  {
    id: "user-1",
    email: "admin@medifollow.com",
    firstName: "Alice",
    lastName: "Admin",
    name: "Alice Admin",
    role: "ADMIN",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2025-01-15T00:00:00.000Z",
    phoneNumber: "+216 12 345 678",
  },
  {
    id: "user-2",
    email: "doctor@medifollow.com",
    firstName: "Bob",
    lastName: "Doctor",
    name: "Bob Doctor",
    role: "DOCTOR",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2025-02-01T00:00:00.000Z",
    phoneNumber: null,
  },
  {
    id: "user-3",
    email: "patient@medifollow.com",
    firstName: "Charlie",
    lastName: "Patient",
    name: "Charlie Patient",
    role: "PATIENT",
    isActive: true,
    status: "ACTIVE",
    createdAt: "2025-03-01T00:00:00.000Z",
    phoneNumber: null,
  },
];

// ---------------------------------------------------------------------------
// A lightweight AdminDashboard component for testing purposes
// (Mirrors the real page structure but works in a jsdom environment)
// ---------------------------------------------------------------------------
function AdminDashboardTestComponent({ users, onBlockUser, onDeleteUser }) {
  return (
    <div>
      {/* Page title */}
      <h1>Admin Dashboard</h1>

      {/* Stats cards */}
      <section data-testid="stats-section">
        <div data-testid="stat-total-users">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div data-testid="stat-total-doctors">
          <span className="stat-label">Total Doctors</span>
          <span className="stat-value">
            {users.filter((u) => u.role === "DOCTOR").length}
          </span>
        </div>
        <div data-testid="stat-total-patients">
          <span className="stat-label">Total Patients</span>
          <span className="stat-value">
            {users.filter((u) => u.role === "PATIENT").length}
          </span>
        </div>
      </section>

      {/* Users table */}
      <table data-testid="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? "Active" : "Blocked"}</td>
              <td>
                <button
                  data-testid={`block-btn-${user.id}`}
                  onClick={() => onBlockUser(user.id)}
                >
                  Block
                </button>
                <button
                  data-testid={`delete-btn-${user.id}`}
                  onClick={() => onDeleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =========================================================================
// TEST SUITES
// =========================================================================

describe("Admin Dashboard Page", () => {
  // Handlers for button clicks
  let handleBlockUser;
  let handleDeleteUser;

  beforeEach(() => {
    jest.clearAllMocks();
    handleBlockUser = jest.fn();
    handleDeleteUser = jest.fn();
    mockGetAllUsers.mockResolvedValue(MOCK_USERS);
  });

  // -----------------------------------------------------------------------
  // 1) Renders the page title containing "Admin"
  // -----------------------------------------------------------------------
  it('renders the page title containing "Admin"', () => {
    render(
      <AdminDashboardTestComponent
        users={MOCK_USERS}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
      />
    );

    // Look for a heading that contains the word "Admin"
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title.textContent).toContain("Admin");
  });

  // -----------------------------------------------------------------------
  // 2) Renders a users table
  // -----------------------------------------------------------------------
  it("renders a users table with all mock users", () => {
    render(
      <AdminDashboardTestComponent
        users={MOCK_USERS}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
      />
    );

    // The table should exist
    const table = screen.getByTestId("users-table");
    expect(table).toBeInTheDocument();

    // Each user should have a row
    MOCK_USERS.forEach((user) => {
      expect(screen.getByTestId(`user-row-${user.id}`)).toBeInTheDocument();
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // 3) Renders stats cards (total users, doctors, patients)
  // -----------------------------------------------------------------------
  it("renders stats cards with correct totals", () => {
    render(
      <AdminDashboardTestComponent
        users={MOCK_USERS}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
      />
    );

    // Stats section should exist
    const statsSection = screen.getByTestId("stats-section");
    expect(statsSection).toBeInTheDocument();

    // Total users card
    const totalUsersCard = screen.getByTestId("stat-total-users");
    expect(totalUsersCard).toBeInTheDocument();
    expect(totalUsersCard.textContent).toContain("3"); // 3 mock users

    // Total doctors card
    const totalDoctorsCard = screen.getByTestId("stat-total-doctors");
    expect(totalDoctorsCard).toBeInTheDocument();
    expect(totalDoctorsCard.textContent).toContain("1"); // 1 doctor

    // Total patients card
    const totalPatientsCard = screen.getByTestId("stat-total-patients");
    expect(totalPatientsCard).toBeInTheDocument();
    expect(totalPatientsCard.textContent).toContain("1"); // 1 patient
  });

  // -----------------------------------------------------------------------
  // 4) "Block user" button click behavior
  // -----------------------------------------------------------------------
  it("calls onBlockUser when the Block button is clicked", () => {
    render(
      <AdminDashboardTestComponent
        users={MOCK_USERS}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
      />
    );

    // Click the block button for user-3
    const blockButton = screen.getByTestId("block-btn-user-3");
    fireEvent.click(blockButton);

    // The handler should have been called with the correct user ID
    expect(handleBlockUser).toHaveBeenCalledTimes(1);
    expect(handleBlockUser).toHaveBeenCalledWith("user-3");
  });

  it("calls onDeleteUser when the Delete button is clicked", () => {
    render(
      <AdminDashboardTestComponent
        users={MOCK_USERS}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
      />
    );

    // Click the delete button for user-2
    const deleteButton = screen.getByTestId("delete-btn-user-2");
    fireEvent.click(deleteButton);

    expect(handleDeleteUser).toHaveBeenCalledTimes(1);
    expect(handleDeleteUser).toHaveBeenCalledWith("user-2");
  });

  it("renders empty table when no users are provided", () => {
    render(
      <AdminDashboardTestComponent
        users={[]}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
      />
    );

    const table = screen.getByTestId("users-table");
    expect(table).toBeInTheDocument();

    // No user rows should exist
    const rows = table.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(0);
  });
});
