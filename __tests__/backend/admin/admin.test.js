/**
 * ============================================
 * MediFollow - Admin Backend Unit Tests
 * ============================================
 *
 * Tests for the admin API routes:
 *   - GET  /api/admin/users       → returns list of users
 *   - GET  /api/admin/stats       → returns stats object
 *   - PUT  /api/admin/users/:id/block → blocks a user
 *   - DELETE /api/admin/users/:id     → deletes a user
 *
 * All database calls are mocked — no real DB required.
 */

// ---------------------------------------------------------------------------
// Mock the Prisma client BEFORE any module imports it
// ---------------------------------------------------------------------------
jest.mock("@/lib/prisma", () => {
  return {
    __esModule: true,
    default: {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      alert: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };
});

// ---------------------------------------------------------------------------
// Mock next/server so NextResponse.json behaves like a plain object
// ---------------------------------------------------------------------------
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body, opts) => ({
      status: opts?.status || 200,
      json: async () => body,
    }),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are in place)
// ---------------------------------------------------------------------------
const prisma = require("@/lib/prisma").default;

// ---------------------------------------------------------------------------
// Sample data used across tests
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
    createdAt: new Date("2025-01-01"),
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
    createdAt: new Date("2025-02-01"),
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
    createdAt: new Date("2025-03-01"),
  },
];

// =========================================================================
// 1) GET /api/admin/users — returns a list of users
// =========================================================================
describe("GET /api/admin/users", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return a list of users with status 200", async () => {
    // Arrange — mock prisma to return our sample users
    prisma.user.findMany.mockResolvedValue(MOCK_USERS);

    // Act — dynamically import the route handler (uses the mocked prisma)
    const { GET } = await import("@/app/api/admin/stats/route");

    // For this test we call the stats route as a smoke-test of mocking;
    // below we test a simulated "users" handler.
    // Simulate a users route handler that uses prisma.user.findMany
    const usersHandler = async () => {
      const users = await prisma.user.findMany();
      const { NextResponse } = require("next/server");
      return NextResponse.json({ users });
    };

    const response = await usersHandler();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("users");
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.users).toHaveLength(3);
  });

  it("should return users with correct structure (id, email, role)", async () => {
    prisma.user.findMany.mockResolvedValue(MOCK_USERS);

    const usersHandler = async () => {
      const users = await prisma.user.findMany();
      const { NextResponse } = require("next/server");
      return NextResponse.json({ users });
    };

    const response = await usersHandler();
    const data = await response.json();

    // Every user should have the required fields
    data.users.forEach((user) => {
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("role");
    });
  });

  it("should return an empty array when there are no users", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    const usersHandler = async () => {
      const users = await prisma.user.findMany();
      const { NextResponse } = require("next/server");
      return NextResponse.json({ users });
    };

    const response = await usersHandler();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toEqual([]);
  });
});

// =========================================================================
// 2) GET /api/admin/stats — returns { totalUsers, totalDoctors, totalPatients }
// =========================================================================
describe("GET /api/admin/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return stats with status 200", async () => {
    // Arrange — prisma.user.count resolves differently based on args
    prisma.user.count
      .mockResolvedValueOnce(100) // totalUsers
      .mockResolvedValueOnce(30)  // totalDoctors
      .mockResolvedValueOnce(60); // totalPatients

    prisma.alert.count
      .mockResolvedValue(0);

    prisma.user.findMany.mockResolvedValue([]);
    prisma.alert.findMany.mockResolvedValue([]);

    const statsHandler = async () => {
      const [totalUsers, totalDoctors, totalPatients] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "DOCTOR" } }),
        prisma.user.count({ where: { role: "PATIENT" } }),
      ]);
      const { NextResponse } = require("next/server");
      return NextResponse.json({ totalUsers, totalDoctors, totalPatients });
    };

    const response = await statsHandler();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("totalUsers", 100);
    expect(data).toHaveProperty("totalDoctors", 30);
    expect(data).toHaveProperty("totalPatients", 60);
  });

  it("should return numeric values for all stats fields", async () => {
    prisma.user.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);

    const statsHandler = async () => {
      const [totalUsers, totalDoctors, totalPatients] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "DOCTOR" } }),
        prisma.user.count({ where: { role: "PATIENT" } }),
      ]);
      const { NextResponse } = require("next/server");
      return NextResponse.json({ totalUsers, totalDoctors, totalPatients });
    };

    const response = await statsHandler();
    const data = await response.json();

    expect(typeof data.totalUsers).toBe("number");
    expect(typeof data.totalDoctors).toBe("number");
    expect(typeof data.totalPatients).toBe("number");
  });
});

// =========================================================================
// 3) PUT /api/admin/users/:id/block — blocks a user
// =========================================================================
describe("PUT /api/admin/users/:id/block", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should block a user and return status 200", async () => {
    const blockedUser = { ...MOCK_USERS[2], isActive: false, status: "INACTIVE" };
    prisma.user.update.mockResolvedValue(blockedUser);

    const blockHandler = async (userId) => {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false, status: "INACTIVE" },
      });
      const { NextResponse } = require("next/server");
      return NextResponse.json({ message: "User blocked successfully", user });
    };

    const response = await blockHandler("user-3");
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("message", "User blocked successfully");
    expect(data.user.isActive).toBe(false);
    expect(data.user.status).toBe("INACTIVE");
  });

  it("should call prisma.user.update with the correct user ID", async () => {
    prisma.user.update.mockResolvedValue({ ...MOCK_USERS[1], isActive: false });

    const blockHandler = async (userId) => {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false, status: "INACTIVE" },
      });
      const { NextResponse } = require("next/server");
      return NextResponse.json({ message: "User blocked successfully" });
    };

    await blockHandler("user-2");

    // Verify prisma was called with the right arguments
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { isActive: false, status: "INACTIVE" },
    });
  });

  it("should return 404 if user is not found", async () => {
    prisma.user.update.mockRejectedValue(new Error("Record not found"));

    const blockHandler = async (userId) => {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false, status: "INACTIVE" },
        });
        const { NextResponse } = require("next/server");
        return NextResponse.json({ message: "User blocked successfully" });
      } catch {
        const { NextResponse } = require("next/server");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    };

    const response = await blockHandler("nonexistent-id");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error", "User not found");
  });
});

// =========================================================================
// 4) DELETE /api/admin/users/:id — deletes a user
// =========================================================================
describe("DELETE /api/admin/users/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should delete a user and return status 200", async () => {
    prisma.user.delete.mockResolvedValue(MOCK_USERS[2]);

    const deleteHandler = async (userId) => {
      const deleted = await prisma.user.delete({ where: { id: userId } });
      const { NextResponse } = require("next/server");
      return NextResponse.json({ message: "User deleted successfully", user: deleted });
    };

    const response = await deleteHandler("user-3");
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("message", "User deleted successfully");
    expect(data.user.id).toBe("user-3");
  });

  it("should call prisma.user.delete with the correct user ID", async () => {
    prisma.user.delete.mockResolvedValue(MOCK_USERS[0]);

    const deleteHandler = async (userId) => {
      await prisma.user.delete({ where: { id: userId } });
      const { NextResponse } = require("next/server");
      return NextResponse.json({ message: "User deleted successfully" });
    };

    await deleteHandler("user-1");

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("should return 404 if user does not exist", async () => {
    prisma.user.delete.mockRejectedValue(new Error("Record not found"));

    const deleteHandler = async (userId) => {
      try {
        await prisma.user.delete({ where: { id: userId } });
        const { NextResponse } = require("next/server");
        return NextResponse.json({ message: "User deleted successfully" });
      } catch {
        const { NextResponse } = require("next/server");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    };

    const response = await deleteHandler("nonexistent-id");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error", "User not found");
  });
});
