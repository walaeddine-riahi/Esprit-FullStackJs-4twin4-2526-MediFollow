/**
 * MediFollow - Vital Records Actions
 * Server actions for vital signs management
 */

"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { VitalRecordSchema } from "@/lib/validation";
import {
  classifyVitalStatus,
  createVitalAlert,
  validateVitalData,
  getVitalViolations,
  DEFAULT_VITAL_THRESHOLDS,
} from "@/lib/utils/vitalValidation";
import { classifyVitalsWithAI } from "@/lib/services/vitals-ai-status.service";

import { checkVitalThresholds } from "./alert.actions";
import { AuditService } from "@/lib/services/audit.service";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export async function createVitalRecord(patientId: string, formData: FormData) {
  try {
    const rawData = {
      systolicBP: formData.get("systolicBP") as string,
      diastolicBP: formData.get("diastolicBP") as string,
      heartRate: formData.get("heartRate") as string,
      temperature: formData.get("temperature") as string,
      oxygenSaturation: formData.get("oxygenSaturation") as string,
      weight: formData.get("weight") as string,
      notes: formData.get("notes") as string,
      recordedAt: formData.get("recordedAt") as string | null,
    };

    // Convert null to undefined for optional fields so Zod treats them as missing
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    );

    const validated = VitalRecordSchema.parse(cleanedData);

    // Convert string values to numbers
    const vitalData: any = {
      patientId,
      recordedAt: validated.recordedAt
        ? new Date(validated.recordedAt)
        : new Date(),
    };

    if (validated.systolicBP)
      vitalData.systolicBP = parseFloat(validated.systolicBP);
    if (validated.diastolicBP)
      vitalData.diastolicBP = parseFloat(validated.diastolicBP);
    if (validated.heartRate)
      vitalData.heartRate = parseFloat(validated.heartRate);
    if (validated.temperature)
      vitalData.temperature = parseFloat(validated.temperature);
    if (validated.oxygenSaturation)
      vitalData.oxygenSaturation = parseFloat(validated.oxygenSaturation);
    if (validated.weight) vitalData.weight = parseFloat(validated.weight);
    if (validated.notes) vitalData.notes = validated.notes;

    // Get patient info for AI classification
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        currentMedications: {
          select: { medication: true },
        },
        user: {
          select: { id: true },
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    // Use AI classification first (improved accuracy)
    let aiHealthStatus;
    let status: "NORMAL" | "A_VERIFIER" | "CRITIQUE" = "NORMAL";

    try {
      const age = patient.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(patient.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : undefined;

      aiHealthStatus = await classifyVitalsWithAI(
        {
          temperature: vitalData.temperature,
          heartRate: vitalData.heartRate,
          oxygenSaturation: vitalData.oxygenSaturation,
          systolicBP: vitalData.systolicBP,
          diastolicBP: vitalData.diastolicBP,
          respiratoryRate: undefined,
        },
        {},
        {
          age,
          specialty: patient.specialty || "GENERAL_MEDICINE",
          medicalHistory: patient.medicalBackground
            ? Object.entries(patient.medicalBackground as any)
                .filter(([_, value]) => value === true)
                .map(([key]) => key)
            : [],
          currentMedications:
            patient.currentMedications?.map((m) => m.medication) || [],
        }
      );

      // Map AI severity to VitalStatus
      const statusMapping: {
        [key: string]: "NORMAL" | "A_VERIFIER" | "CRITIQUE";
      } = {
        EXCELLENT: "NORMAL",
        GOOD: "NORMAL",
        FAIR: "A_VERIFIER",
        POOR: "A_VERIFIER",
        CRITICAL: "CRITIQUE",
      };

      status = statusMapping[aiHealthStatus.severity] || "A_VERIFIER";
      console.log(
        `[CreateVital] AI Classification: ${aiHealthStatus.severity} → ${status}`
      );
    } catch (aiError) {
      console.error(
        "[CreateVital] AI classification failed, using rule-based:",
        aiError
      );
      // Fallback to rule-based classification
      const ruleBasedStatus = await classifyVitalStatus(
        {
          systolicBP: vitalData.systolicBP,
          diastolicBP: vitalData.diastolicBP,
          heartRate: vitalData.heartRate,
          temperature: vitalData.temperature,
          oxygenSaturation: vitalData.oxygenSaturation,
          weight: vitalData.weight,
        },
        patientId
      );
      status = ruleBasedStatus;
    }

    vitalData.status = status;

    // Get patient thresholds for violations
    const thresholds: any =
      patient?.vitalThresholds || DEFAULT_VITAL_THRESHOLDS;
    const violations = getVitalViolations(vitalData, thresholds);

    if (violations.critical.length > 0 || violations.abnormal.length > 0) {
      vitalData.triggeredRules = JSON.parse(
        JSON.stringify({
          ...violations.triggeredRules,
          aiAnalysis: aiHealthStatus,
        })
      );
    }

    const vitalRecord = await prisma.vitalRecord.create({
      data: vitalData,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create alert if status is not NORMAL
    if (status !== "NORMAL") {
      await createVitalAlert(vitalRecord.id, patientId, status, violations);
    }

    // Also run legacy thresholds check for compatibility
    await checkVitalThresholds(vitalRecord);

    // Log the create action to audit log
    try {
      const currentUser = await getCurrentUser();
      const auditorId = currentUser?.id || vitalRecord.patient.userId;
      await AuditService.logCreateVitalSign(auditorId, vitalRecord.id, {
        patientId,
        systolicBP: vitalRecord.systolicBP,
        diastolicBP: vitalRecord.diastolicBP,
        heartRate: vitalRecord.heartRate,
        temperature: vitalRecord.temperature,
        oxygenSaturation: vitalRecord.oxygenSaturation,
      });
      console.log(
        "📝 [CREATE_VITAL_SIGN] Audit log created for vital record:",
        vitalRecord.id
      );
    } catch (auditError) {
      console.error(
        "Error creating audit log for vital record creation:",
        auditError
      );
    }

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/doctor/vitals");

    return {
      success: true,
      message: "Constantes vitales enregistrées",
      vitalRecord,
    };
  } catch (error: any) {
    console.error("Create vital record error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

export async function getVitalRecords(patientId: string, limit?: number) {
  try {
    const records = await prisma.vitalRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
      take: limit,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return { success: true, records };
  } catch (error) {
    console.error("Get vital records error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération",
      records: [],
    };
  }
}

export async function getLatestVitalRecord(patientId: string) {
  try {
    const record = await prisma.vitalRecord.findFirst({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
    });

    return { success: true, record };
  } catch (error) {
    console.error("Get latest vital record error:", error);
    return { success: false, error: "Erreur", record: null };
  }
}

export async function getVitalRecordById(id: string) {
  try {
    const record = await prisma.vitalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return { success: true, record };
  } catch (error) {
    console.error("Get vital record error:", error);
    return { success: false, error: "Erreur", record: null };
  }
}

export async function deleteVitalRecord(id: string) {
  try {
    // Get the record before deleting for audit log
    const record = await prisma.vitalRecord.findUnique({
      where: { id },
      include: { patient: { include: { user: true } } },
    });

    await prisma.vitalRecord.delete({
      where: { id },
    });

    // Log the delete action to audit log
    try {
      const currentUser = await getCurrentUser();
      const auditorId = currentUser?.id || record?.patient.userId || "SYSTEM";
      await AuditService.logDeleteVitalSign(auditorId, id, {
        patientId: record?.patientId,
        systolicBP: record?.systolicBP,
        diastolicBP: record?.diastolicBP,
        heartRate: record?.heartRate,
      });
      console.log(
        "📝 [DELETE_VITAL_SIGN] Audit log created for vital record:",
        id
      );
    } catch (auditError) {
      console.error(
        "Error creating audit log for vital record deletion:",
        auditError
      );
    }

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/doctor/vitals");

    return { success: true, message: "Enregistrement supprimé" };
  } catch (error) {
    console.error("Delete vital record error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function updateVitalRecord(id: string, formData: FormData) {
  try {
    const rawData = {
      systolicBP: formData.get("systolicBP") as string,
      diastolicBP: formData.get("diastolicBP") as string,
      heartRate: formData.get("heartRate") as string,
      temperature: formData.get("temperature") as string,
      oxygenSaturation: formData.get("oxygenSaturation") as string,
      weight: formData.get("weight") as string,
      notes: formData.get("notes") as string,
    };

    // Convert null to undefined for optional fields so Zod treats them as missing
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    );

    const validated = VitalRecordSchema.parse(cleanedData);

    // Convert string values to numbers
    const vitalData: any = {};

    if (validated.systolicBP)
      vitalData.systolicBP = parseFloat(validated.systolicBP);
    if (validated.diastolicBP)
      vitalData.diastolicBP = parseFloat(validated.diastolicBP);
    if (validated.heartRate)
      vitalData.heartRate = parseFloat(validated.heartRate);
    if (validated.temperature)
      vitalData.temperature = parseFloat(validated.temperature);
    if (validated.oxygenSaturation)
      vitalData.oxygenSaturation = parseFloat(validated.oxygenSaturation);
    if (validated.weight) vitalData.weight = parseFloat(validated.weight);
    if (validated.notes !== undefined) vitalData.notes = validated.notes;

    // Get the existing vital record to get patientId and other context
    const existingRecord = await prisma.vitalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            currentMedications: {
              select: { medication: true },
            },
            user: true,
          },
        },
      },
    });

    if (!existingRecord) {
      return { success: false, error: "Vital record not found" };
    }

    // Re-classify status with AI
    let aiHealthStatus;
    let newStatus: "NORMAL" | "A_VERIFIER" | "CRITIQUE" = "NORMAL";

    try {
      const age = existingRecord.patient.dateOfBirth
        ? Math.floor(
            (Date.now() -
              new Date(existingRecord.patient.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : undefined;

      aiHealthStatus = await classifyVitalsWithAI(
        {
          temperature: vitalData.temperature ?? existingRecord.temperature,
          heartRate: vitalData.heartRate ?? existingRecord.heartRate,
          oxygenSaturation:
            vitalData.oxygenSaturation ?? existingRecord.oxygenSaturation,
          systolicBP: vitalData.systolicBP ?? existingRecord.systolicBP,
          diastolicBP: vitalData.diastolicBP ?? existingRecord.diastolicBP,
          respiratoryRate: undefined,
        },
        {},
        {
          age,
          specialty: existingRecord.patient.specialty || "GENERAL_MEDICINE",
          medicalHistory: existingRecord.patient.medicalBackground
            ? Object.entries(existingRecord.patient.medicalBackground as any)
                .filter(([_, value]) => value === true)
                .map(([key]) => key)
            : [],
          currentMedications:
            existingRecord.patient.currentMedications?.map(
              (m) => m.medication
            ) || [],
        }
      );

      // Map AI severity to VitalStatus
      const statusMapping: {
        [key: string]: "NORMAL" | "A_VERIFIER" | "CRITIQUE";
      } = {
        EXCELLENT: "NORMAL",
        GOOD: "NORMAL",
        FAIR: "A_VERIFIER",
        POOR: "A_VERIFIER",
        CRITICAL: "CRITIQUE",
      };

      newStatus = statusMapping[aiHealthStatus.severity] || "A_VERIFIER";
      vitalData.status = newStatus;
      console.log(
        `[UpdateVital] AI Classification: ${aiHealthStatus.severity} → ${newStatus}`
      );
    } catch (aiError) {
      console.error(
        "[UpdateVital] AI classification failed, keeping current status:",
        aiError
      );
      // Don't update status if AI fails
    }

    // Update vital record
    const vitalRecord = await prisma.vitalRecord.update({
      where: { id },
      data: vitalData,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    // Re-check thresholds
    await checkVitalThresholds(vitalRecord);

    // Log the update action to audit log
    try {
      const currentUser = await getCurrentUser();
      const auditorId = currentUser?.id || vitalRecord.patient.userId;
      await AuditService.logAction({
        userId: auditorId,
        action: "UPDATE_VITAL_SIGN" as any,
        entityType: "VitalRecord",
        entityId: id,
        changes: {
          updated: {
            oldValue: null,
            newValue: vitalData,
          },
        },
      });
      console.log(
        "📝 [UPDATE_VITAL_SIGN] Audit log created for vital record:",
        id
      );
    } catch (auditError) {
      console.error(
        "Error creating audit log for vital record update:",
        auditError
      );
    }

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/doctor/vitals");

    return {
      success: true,
      message: "Constantes vitales modifiées",
      vitalRecord,
    };
  } catch (error: any) {
    console.error("Update vital record error:", error);
    return { success: false, error: "Erreur lors de la modification" };
  }
}

export async function getVitalStats(patientId: string, days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await prisma.vitalRecord.findMany({
      where: {
        patientId,
        recordedAt: {
          gte: startDate,
        },
      },
      orderBy: { recordedAt: "asc" },
    });

    // Calculate averages
    const stats = {
      avgSystolicBP: 0,
      avgDiastolicBP: 0,
      avgHeartRate: 0,
      avgTemperature: 0,
      avgOxygenSaturation: 0,
      recordCount: records.length,
      records,
    };

    if (records.length > 0) {
      const systolic = records
        .filter((r: any) => r.systolicBP)
        .map((r: any) => r.systolicBP!);
      const diastolic = records
        .filter((r: any) => r.diastolicBP)
        .map((r: any) => r.diastolicBP!);
      const heartRate = records
        .filter((r: any) => r.heartRate)
        .map((r: any) => r.heartRate!);
      const temp = records
        .filter((r: any) => r.temperature)
        .map((r: any) => r.temperature!);
      const spo2 = records
        .filter((r: any) => r.oxygenSaturation)
        .map((r: any) => r.oxygenSaturation!);

      if (systolic.length)
        stats.avgSystolicBP =
          systolic.reduce((a: number, b: number) => a + b, 0) / systolic.length;
      if (diastolic.length)
        stats.avgDiastolicBP =
          diastolic.reduce((a: number, b: number) => a + b, 0) /
          diastolic.length;
      if (heartRate.length)
        stats.avgHeartRate =
          heartRate.reduce((a: number, b: number) => a + b, 0) /
          heartRate.length;
      if (temp.length)
        stats.avgTemperature =
          temp.reduce((a: number, b: number) => a + b, 0) / temp.length;
      if (spo2.length)
        stats.avgOxygenSaturation =
          spo2.reduce((a: number, b: number) => a + b, 0) / spo2.length;
    }

    return { success: true, stats };
  } catch (error) {
    console.error("Get vital stats error:", error);
    return { success: false, error: "Erreur", stats: null };
  }
}

/**
 * DOCTOR REVIEW FUNCTIONS
 */

/**
 * Get vital records pending doctor review
 */
export async function getVitalsToReview(doctorId?: string, patientId?: string) {
  try {
    const where: any = {
      reviewStatus: "PENDING",
    };

    if (patientId) {
      where.patientId = patientId;
    }

    const records = await prisma.vitalRecord.findMany({
      where,
      orderBy: {
        recordedAt: "desc",
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    return { success: true, records };
  } catch (error: any) {
    console.error("Get vitals to review error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération",
      records: [],
    };
  }
}

/**
 * Review vital record by doctor
 * Adds doctor notes and updates review status
 */
export async function reviewVitalRecord(
  recordId: string,
  doctorId: string,
  reviewNotes: string,
  newStatus?: "NORMAL" | "A_VERIFIER" | "CRITIQUE"
) {
  try {
    // Get current record
    const currentRecord = await prisma.vitalRecord.findUnique({
      where: { id: recordId },
      include: { patient: true },
    });

    if (!currentRecord) {
      return { success: false, error: "Enregistrement non trouvé" };
    }

    // Update with review info
    const updated = await prisma.vitalRecord.update({
      where: { id: recordId },
      data: {
        reviewStatus: "REVIEWED",
        reviewedById: doctorId,
        reviewedAt: new Date(),
        reviewNotes,
        // Optionally update status based on doctor's review
        ...(newStatus && { status: newStatus }),
      },
      include: {
        patient: { include: { user: true } },
        reviewedBy: true,
        alerts: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: "REVIEW_VITAL",
        entityType: "VitalRecord",
        entityId: recordId,
        changes: {
          reviewStatus: "REVIEWED",
          reviewNotes,
          statusChanged: newStatus ? currentRecord.status !== newStatus : false,
          newStatus,
        },
        timestamp: new Date(),
      },
    });

    revalidatePath("/dashboard/doctor/vitals-review");
    revalidatePath(`/dashboard/patient/${currentRecord.patientId}/vitals`);

    return {
      success: true,
      message: "Revision enregistrée",
      record: updated,
    };
  } catch (error: any) {
    console.error("Review vital record error:", error);
    return { success: false, error: "Erreur lors de la révision" };
  }
}

/**
 * Get vital review history for a record
 */
export async function getVitalReviewHistory(recordId: string) {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "VitalRecord",
        entityId: recordId,
        action: "REVIEW_VITAL",
      },
      include: {
        user: true,
      },
      orderBy: { timestamp: "desc" },
    });

    return { success: true, history: auditLogs };
  } catch (error: any) {
    console.error("Get vital review history error:", error);
    return { success: false, error: "Erreur", history: [] };
  }
}

/**
 * Reclassify all vital records using AI classification
 * This is useful for fixing historical vitals that were classified with incorrect logic
 * ADMIN ONLY - Should be called from API endpoint with proper auth
 */
export async function reclassifyAllVitals() {
  try {
    console.log("[ReclassifyVitals] Starting batch reclassification...");

    const allVitals = await prisma.vitalRecord.findMany({
      include: {
        patient: {
          include: {
            currentMedications: true,
            user: true,
          },
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    let updated = 0;
    let failed = 0;

    for (const vital of allVitals) {
      try {
        const age = vital.patient.dateOfBirth
          ? Math.floor(
              (Date.now() - new Date(vital.patient.dateOfBirth).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : undefined;

        const aiHealthStatus = await classifyVitalsWithAI(
          {
            temperature: vital.temperature || undefined,
            heartRate: vital.heartRate || undefined,
            oxygenSaturation: vital.oxygenSaturation || undefined,
            systolicBP: vital.systolicBP || undefined,
            diastolicBP: vital.diastolicBP || undefined,
            respiratoryRate: undefined,
          },
          {},
          {
            age,
            specialty: vital.patient.specialty || "GENERAL_MEDICINE",
            medicalHistory: vital.patient.medicalBackground
              ? Object.entries(vital.patient.medicalBackground as any)
                  .filter(([_, value]) => value === true)
                  .map(([key]) => key)
              : [],
            currentMedications:
              vital.patient.currentMedications?.map((m) => m.medication) || [],
          }
        );

        const statusMapping: {
          [key: string]: "NORMAL" | "A_VERIFIER" | "CRITIQUE";
        } = {
          EXCELLENT: "NORMAL",
          GOOD: "NORMAL",
          FAIR: "A_VERIFIER",
          POOR: "A_VERIFIER",
          CRITICAL: "CRITIQUE",
        };

        const newStatus =
          statusMapping[aiHealthStatus.severity] || "A_VERIFIER";

        if (vital.status !== newStatus) {
          await prisma.vitalRecord.update({
            where: { id: vital.id },
            data: {
              status: newStatus,
              triggeredRules: JSON.parse(JSON.stringify(aiHealthStatus)),
            },
          });

          console.log(
            `[ReclassifyVitals] Updated ${vital.id}: ${vital.status} → ${newStatus}`
          );
          updated++;
        }
      } catch (vitErr) {
        console.error(`[ReclassifyVitals] Failed for id ${vital.id}:`, vitErr);
        failed++;
      }
    }

    console.log(
      `[ReclassifyVitals] Completed: ${updated} updated, ${failed} failed`
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");

    return {
      success: true,
      updated,
      failed,
      total: allVitals.length,
      message: `Reclassification completed: ${updated}/${allVitals.length} vitals updated`,
    };
  } catch (error: any) {
    console.error("[ReclassifyVitals] Error:", error);
    return {
      success: false,
      error: "Erreur lors de la reclassification",
      updated: 0,
      failed: 0,
    };
  }
}
