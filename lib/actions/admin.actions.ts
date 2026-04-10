"use server";

import prisma from "@/lib/prisma";

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getAlertStats() {
  try {
    const stats = await prisma.alert.groupBy({
      by: ["status"],
      _count: true,
    });

    const total = stats.reduce((acc, c) => acc + c._count, 0);
    const open = stats.find((s) => s.status === "OPEN")?._count || 0;
    const resolved = stats.find((s) => s.status === "RESOLVED")?._count || 0;
    const critical = await prisma.alert.count({
      where: { severity: "CRITICAL" },
    });

    return {
      stats: {
        total,
        open,
        resolved,
        critical,
      },
    };
  } catch (error) {
    console.error("Error fetching alert stats:", error);
    return {
      stats: {
        total: 0,
        open: 0,
        resolved: 0,
        critical: 0,
      },
    };
  }
}
