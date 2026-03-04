"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Get all users
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

// Get user by ID - ADD THIS FUNCTION
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

// Update user
export async function updateUser(userId: string, data: any) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role as Role, // must be 'ADMIN', 'DOCTOR', or 'PATIENT'
        isActive: data.isActive,
        phoneNumber: data.phoneNumber ?? undefined,
        // specialization removed (not in schema)
      },
    });
    
    revalidatePath("/dashboard/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

// Delete user
export async function deleteUser(userId: string) {
  try {
    // Delete related records first (if any)
    // await prisma.appointment.deleteMany({ where: { userId } });
    // await prisma.alert.deleteMany({ where: { userId } });
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// Create user
export async function createUser(data: any) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: hashedPassword,
        role: data.role,
        isActive: data.isActive,
        phoneNumber: data.phoneNumber,
      },
    });
    
    revalidatePath("/dashboard/admin/users");
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

// Toggle user status
export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    
    revalidatePath("/dashboard/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

// Get users by role
export async function getUsersByRole(role: string) {
  try {
    const users = await prisma.user.findMany({
      where: { role: role as Role },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return users;
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" as Role } });
    const totalDoctors = await prisma.user.count({ where: { role: "DOCTOR" as Role } });
    const totalPatients = await prisma.user.count({ where: { role: "PATIENT" as Role } });
    
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await prisma.user.count({ where: { isActive: false } });
    
    return {
      totalUsers,
      totalAdmins,
      totalDoctors,
      totalPatients,
      activeUsers,
      inactiveUsers,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}