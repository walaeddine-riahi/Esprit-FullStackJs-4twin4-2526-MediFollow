"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PatientCreateInput,
  SafeUser,
  PatientWithUser,
  PatientWithRelations,
} from "@/types/medifollow.types";
import { revalidatePath } from "next/cache";

/**
 * Get a patient by user ID
 */
export async function getPatientByUserId(
  userId: string
): Promise<PatientWithUser | null> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return patient;
  } catch (error) {
    console.error("Error fetching patient by user ID:", error);
    return null;
  }
}

/**
 * Get a patient by ID
 */
export async function getPatientById(
  patientId: string
): Promise<PatientWithUser | null> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return patient;
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    return null;
  }
}

/**
 * Get patient with full relations (vitals, alerts, symptoms)
 */
export async function getPatientWithRelations(
  patientId: string
): Promise<PatientWithRelations | null> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        symptoms: {
          orderBy: { occurredAt: "desc" },
          take: 10,
        },
      },
    });

    return patient;
  } catch (error) {
    console.error("Error fetching patient with relations:", error);
    return null;
  }
}

/**
 * Get all patients (for doctors/admins)
 */
export async function getAllPatients(): Promise<PatientWithUser[]> {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return patients;
  } catch (error) {
    console.error("Error fetching all patients:", error);
    return [];
  }
}

/**
 * Create a new patient profile
 * Used during registration or by admin
 */
export async function createPatient(
  data: PatientCreateInput
): Promise<{ success: boolean; patient?: PatientWithUser; error?: string }> {
  try {
    // Check if patient already exists for this user
    const existingPatient = await prisma.patient.findUnique({
      where: { userId: data.userId },
    });

    if (existingPatient) {
      return {
        success: false,
        error: "Un profil patient existe déjà pour cet utilisateur",
      };
    }

    // Check if medical record number is unique
    const existingMRN = await prisma.patient.findUnique({
      where: { medicalRecordNumber: data.medicalRecordNumber },
    });

    if (existingMRN) {
      return {
        success: false,
        error: "Ce numéro de dossier médical est déjà utilisé",
      };
    }

    const patient = await prisma.patient.create({
      data: {
        userId: data.userId,
        medicalRecordNumber: data.medicalRecordNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodType: data.bloodType,
        address: data.address as Prisma.InputJsonValue,
        emergencyContact: data.emergencyContact as Prisma.InputJsonValue,
        dischargeDate: data.dischargeDate,
        diagnosis: data.diagnosis,
        medications: data.medications as Prisma.InputJsonValue,
        vitalThresholds: data.vitalThresholds as Prisma.InputJsonValue,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/admin");

    return { success: true, patient };
  } catch (error) {
    console.error("Error creating patient:", error);
    return {
      success: false,
      error: "Erreur lors de la création du profil patient",
    };
  }
}

/**
 * Update patient information
 */
export async function updatePatient(
  patientId: string,
  data: Partial<PatientCreateInput>
): Promise<{ success: boolean; patient?: PatientWithUser; error?: string }> {
  try {
    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(data.gender && { gender: data.gender }),
        ...(data.bloodType && { bloodType: data.bloodType }),
        ...(data.address && { address: data.address as Prisma.InputJsonValue }),
        ...(data.emergencyContact && {
          emergencyContact: data.emergencyContact as Prisma.InputJsonValue,
        }),
        ...(data.dischargeDate && { dischargeDate: data.dischargeDate }),
        ...(data.diagnosis && { diagnosis: data.diagnosis }),
        ...(data.medications && {
          medications: data.medications as Prisma.InputJsonValue,
        }),
        ...(data.vitalThresholds && {
          vitalThresholds: data.vitalThresholds as Prisma.InputJsonValue,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/admin");

    return { success: true, patient };
  } catch (error) {
    console.error("Error updating patient:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil patient",
    };
  }
}

/**
 * Deactivate a patient (soft delete)
 */
export async function deactivatePatient(
  patientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deactivating patient:", error);
    return {
      success: false,
      error: "Erreur lors de la désactivation du patient",
    };
  }
}

/**
 * Search patients by name, email, or medical record number
 */
export async function searchPatients(
  query: string
): Promise<PatientWithUser[]> {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        OR: [
          { medicalRecordNumber: { contains: query, mode: "insensitive" } },
          { user: { firstName: { contains: query, mode: "insensitive" } } },
          { user: { lastName: { contains: query, mode: "insensitive" } } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      take: 20,
    });

    return patients;
  } catch (error) {
    console.error("Error searching patients:", error);
    return [];
  }
}
