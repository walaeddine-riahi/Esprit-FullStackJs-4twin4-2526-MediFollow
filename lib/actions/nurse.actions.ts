"use server";

import prisma from "@/lib/prisma";
import {
  AlertStatus,
  ReminderType,
  ReminderPriority,
} from "@/types/medifollow.types";
import { AuditService } from "@/lib/services/audit.service";

/**
 * Get all patients assigned to a nurse (patients with reminders from this nurse)
 */
export async function getNursePatients(nurseId: string) {
  try {
    const assignments = await prisma.patientReminder.findMany({
      where: { nurseId },
      distinct: ["patientId"],
      include: {
        patient: {
          include: {
            user: true,
            vitalRecords: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
            alerts: {
              where: { status: "OPEN" },
            },
          },
        },
      },
    });

    return {
      success: true,
      patients: assignments.map((a) => a.patient),
    };
  } catch (error) {
    console.error("Error fetching nurse patients:", error);
    return { success: false, error: "Failed to fetch patients" };
  }
}

/**
 * Get ALL patients in the system for nurse management
 */
export async function getAllPatientsForNurse() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            isActive: true,
            createdAt: true,
          },
        },
        vitalRecords: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        alerts: {
          where: { status: "OPEN" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      patients,
    };
  } catch (error) {
    console.error("Error fetching all patients:", error);
    return { success: false, error: "Failed to fetch patients" };
  }
}

/**
 * Get all alerts for patients assigned to a nurse
 */
export async function getNurseAlerts(nurseId: string, status?: AlertStatus) {
  try {
    // First get all patient IDs assigned to the nurse
    const assignments = await prisma.patientReminder.findMany({
      where: { nurseId },
      distinct: ["patientId"],
      select: { patientId: true },
    });

    const patientIds = assignments.map((a) => a.patientId);

    // Then fetch alerts for those patients
    const alerts = await prisma.alert.findMany({
      where: {
        patientId: { in: patientIds },
        ...(status && { status }),
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      alerts,
      stats: {
        total: alerts.length,
        open: alerts.filter((a) => a.status === "OPEN").length,
        acknowledged: alerts.filter((a) => a.status === "ACKNOWLEDGED").length,
        resolved: alerts.filter((a) => a.status === "RESOLVED").length,
      },
    };
  } catch (error) {
    console.error("Error fetching nurse alerts:", error);
    return { success: false, error: "Failed to fetch alerts" };
  }
}

/**
 * Get all reminders for a nurse
 */
export async function getNurseReminders(nurseId: string) {
  try {
    const reminders = await prisma.patientReminder.findMany({
      where: { nurseId },
      include: {
        patient: {
          include: { user: true },
        },
      },
      orderBy: { scheduledFor: "asc" },
    });

    return {
      success: true,
      reminders,
      stats: {
        total: reminders.length,
        pending: reminders.filter((r) => !r.isSent).length,
        unread: reminders.filter((r) => r.isSent && !r.isRead).length,
      },
    };
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return { success: false, error: "Failed to fetch reminders" };
  }
}

/**
 * Create a new reminder for a patient
 */
export async function createPatientReminder(
  nurseId: string,
  patientId: string,
  data: {
    title: string;
    message: string;
    reminderType: ReminderType;
    scheduledFor: Date;
    priority?: ReminderPriority;
  }
) {
  try {
    const reminder = await prisma.patientReminder.create({
      data: {
        nurseId,
        patientId,
        title: data.title,
        message: data.message,
        reminderType: data.reminderType,
        scheduledFor: data.scheduledFor,
        priority: data.priority || "NORMAL",
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    return {
      success: true,
      reminder,
      message: "Rappel créé avec succès",
    };
  } catch (error) {
    console.error("Error creating reminder:", error);
    return { success: false, error: "Failed to create reminder" };
  }
}

/**
 * Send a reminder to a patient
 */
export async function sendPatientReminder(reminderId: string) {
  try {
    const reminder = await prisma.patientReminder.update({
      where: { id: reminderId },
      data: {
        isSent: true,
        sentAt: new Date(),
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    // TODO: Send notification to patient (email, SMS, in-app)

    return {
      success: true,
      reminder,
      message: "Rappel envoyé",
    };
  } catch (error) {
    console.error("Error sending reminder:", error);
    return { success: false, error: "Failed to send reminder" };
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string, nurseId: string) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedById: nurseId,
        acknowledgedAt: new Date(),
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    return {
      success: true,
      alert,
      message: "Alerte acceptée",
    };
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return { success: false, error: "Failed to acknowledge alert" };
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(
  alertId: string,
  nurseId: string,
  resolution?: string
) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedById: nurseId,
        resolvedAt: new Date(),
        resolution: resolution || "Resolved by nurse",
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    return {
      success: true,
      alert,
      message: "Alerte résolue",
    };
  } catch (error) {
    console.error("Error resolving alert:", error);
    return { success: false, error: "Failed to resolve alert" };
  }
}

/**
 * Assign a patient to a doctor
 */
export async function assignPatientToDoctor(
  patientId: string,
  doctorId: string,
  nurseId: string
) {
  try {
    console.log("📋 [ASSIGN] Starting assignment:", {
      patientId,
      doctorId,
      nurseId,
    });

    // Verify patient and doctor exist
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    console.log("👥 [ASSIGN] Patient found:", patient?.id, patient?.user.email);
    if (!patient) {
      console.log("❌ [ASSIGN] Patient not found for ID:", patientId);
      return { success: false, error: "Patient not found" };
    }

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: { doctorProfile: true },
    });

    console.log(
      "👨‍⚕️ [ASSIGN] Doctor found:",
      doctor?.id,
      doctor?.email,
      "role:",
      doctor?.role
    );
    if (!doctor || doctor.role !== "DOCTOR") {
      console.log(
        "❌ [ASSIGN] Doctor not found or invalid role:",
        doctor?.role
      );
      return { success: false, error: "Doctor not found or invalid role" };
    }

    // Create or update AccessGrant
    console.log("🔗 [ASSIGN] Creating AccessGrant for:", {
      patientUserId: patient.userId,
      doctorId: doctorId,
    });

    const accessGrant = await prisma.accessGrant.upsert({
      where: {
        patientId_doctorId: {
          patientId: patient.userId,
          doctorId: doctorId,
        },
      },
      update: {
        isActive: true,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
      },
      create: {
        patientId: patient.userId,
        doctorId: doctorId,
        durationDays: 365,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    console.log("✅ [ASSIGN] AccessGrant created/updated:", {
      id: accessGrant.id,
      patientId: accessGrant.patientId,
      doctorId: accessGrant.doctorId,
      isActive: accessGrant.isActive,
      expiresAt: accessGrant.expiresAt,
    });

    // Log the patient assignment to audit log
    await AuditService.logAction({
      userId: nurseId,
      action: "GRANT_ACCESS" as any,
      entityType: "AccessGrant",
      entityId: accessGrant.id,
      changes: {
        assignment: {
          oldValue: null,
          newValue: {
            patientId: patient.id,
            patientEmail: patient.user.email,
            patientName: `${patient.user.firstName} ${patient.user.lastName}`,
            doctorId: doctor.id,
            doctorEmail: doctor.email,
            doctorName: `${doctor.firstName} ${doctor.lastName}`,
          },
        },
      },
    });
    console.log(
      "📝 [ASSIGN] Audit log created for AccessGrant:",
      accessGrant.id
    );

    return {
      success: true,
      message: `Patient ${patient.user.firstName} ${patient.user.lastName} assigned to Dr. ${doctor.firstName} ${doctor.lastName} successfully`,
      accessGrant,
    };
  } catch (error) {
    console.error("❌ [ASSIGN] Error assigning patient:", error);
    return { success: false, error: "Failed to assign patient to doctor" };
  }
}

/**
 * Get nurse profile
 */
export async function getNurseProfile(userId: string) {
  try {
    const profile = await prisma.nurseProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Nurse profile not found" };
    }

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error("Error fetching nurse profile:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

/**
 * Update nurse profile
 */
export async function updateNurseProfile(
  userId: string,
  data: {
    licenseNumber?: string;
    bio?: string;
    phone?: string;
    location?: string;
    specialization?: string;
  }
) {
  try {
    const profile = await prisma.nurseProfile.update({
      where: { userId },
      data,
      include: {
        user: true,
      },
    });

    return {
      success: true,
      profile,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating nurse profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Get all doctors available for patient assignment
 */
export async function getAllDoctors() {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      doctors: doctors.map((doc) => ({
        id: doc.userId,
        name: `Dr. ${doc.user.firstName} ${doc.user.lastName}`,
        email: doc.user.email,
        specialty: doc.specialty,
        phone: doc.phone,
        location: doc.location,
      })),
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error: "Failed to fetch doctors", doctors: [] };
  }
}

/**
 * Get patient vital records for a patient assigned to nurse
 */
export async function getPatientVitals(patientId: string) {
  try {
    const vitals = await prisma.vitalRecord.findMany({
      where: { patientId },
      include: {
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { recordedAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      vitals,
    };
  } catch (error) {
    console.error("Error fetching patient vitals:", error);
    return { success: false, error: "Failed to fetch vitals" };
  }
}

/**
 * Enter vital data for a patient
 */
export async function enterPatientVital(
  patientId: string,
  data: {
    systolic: number;
    diastolic: number;
    heartRate: number;
    temperature: number;
    spO2: number;
    weight?: number;
    notes?: string;
  }
) {
  try {
    const vitalRecord = await prisma.vitalRecord.create({
      data: {
        patientId,
        systolic: data.systolic,
        diastolic: data.diastolic,
        heartRate: data.heartRate,
        temperature: data.temperature,
        spO2: data.spO2,
        weight: data.weight,
        notes: data.notes,
        recordedAt: new Date(),
        status: "A_VERIFIER", // Will be validated against thresholds
      },
    });

    return {
      success: true,
      vitalRecord,
      message: "Vital data recorded successfully",
    };
  } catch (error) {
    console.error("Error entering vital data:", error);
    return { success: false, error: "Failed to record vital data" };
  }
}
