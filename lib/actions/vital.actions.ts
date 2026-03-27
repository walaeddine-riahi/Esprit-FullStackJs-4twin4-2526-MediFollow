/**
 * MediFollow - Vital Records Actions
 * Server actions for vital signs management
 */

"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { VitalRecordSchema } from "@/lib/validation";
import { validateVitalSigns, generateAlertMessage } from "@/lib/utils/vitalValidation";
import { VitalStatus } from "@/constants/thresholds";
import { sendAlertNotifications } from "@/lib/services/notificationService";

import { checkVitalThresholds } from "./alert.actions";

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
      recordedAt: formData.get("recordedAt") as string,
      symptoms: formData.get("symptoms") as string,
    };

    const validated = VitalRecordSchema.parse(rawData);

    // Convert string values to numbers
    const vitalData: any = {
      patientId,
      recordedAt: validated.recordedAt
        ? new Date(validated.recordedAt)
        : new Date(),
    };

    if (validated.systolicBP)
      vitalData.systolicBP = parseFloat(validated.systolicBP.toString());
    if (validated.diastolicBP)
      vitalData.diastolicBP = parseFloat(validated.diastolicBP.toString());
    if (validated.heartRate)
      vitalData.heartRate = parseFloat(validated.heartRate.toString());
    if (validated.temperature)
      vitalData.temperature = parseFloat(validated.temperature.toString());
    if (validated.oxygenSaturation)
      vitalData.oxygenSaturation = parseFloat(validated.oxygenSaturation);
    if (validated.weight) 
      vitalData.weight = parseFloat(validated.weight.toString());
    if (validated.notes) 
      vitalData.notes = validated.notes;
    if (validated.symptoms) 
      vitalData.symptoms = JSON.parse(validated.symptoms);

    // ============================================
    // VALIDATION DES SEUILS STATIQUES
    // ============================================
    
    // Récupérer le poids précédent si nécessaire
    let previousWeight;
    if (vitalData.weight) {
      const lastRecord = await prisma.vitalRecord.findFirst({
        where: { 
          patientId,
          weight: { not: null }
        },
        orderBy: { recordedAt: "desc" },
        select: { weight: true, recordedAt: true },
      });
      
      if (lastRecord && lastRecord.weight) {
        previousWeight = {
          weight: lastRecord.weight,
          recordedAt: lastRecord.recordedAt,
        };
      }
    }

    // Valider les signes vitaux contre les seuils
    const validationResult = validateVitalSigns(
      {
        temperature: vitalData.temperature,
        systolicBP: vitalData.systolicBP,
        diastolicBP: vitalData.diastolicBP,
        heartRate: vitalData.heartRate,
        oxygenSaturation: vitalData.oxygenSaturation,
        weight: vitalData.weight,
      },
      previousWeight
    );

    // Ajouter le statut et les règles déclenchées
    vitalData.status = validationResult.status;
    vitalData.triggeredRules = validationResult.triggeredRules.length > 0
      ? validationResult.triggeredRules
      : undefined;

    // Create vital record
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

    // ============================================
    // CRÉER ALERTES SI NÉCESSAIRE
    // ============================================
    if (validationResult.needsAlert && validationResult.alertSeverity) {
      // Créer une alerte basée sur les règles déclenchées
      const alertMessage = generateAlertMessage(validationResult.triggeredRules);
      
      await prisma.alert.create({
        data: {
          patientId,
          vitalRecordId: vitalRecord.id,
          alertType: "VITAL",
          severity: validationResult.alertSeverity,
          message: alertMessage,
          data: {
            triggeredRules: validationResult.triggeredRules,
            vitalValues: {
              temperature: vitalData.temperature,
              systolicBP: vitalData.systolicBP,
              diastolicBP: vitalData.diastolicBP,
              heartRate: vitalData.heartRate,
              oxygenSaturation: vitalData.oxygenSaturation,
              weight: vitalData.weight,
            },
          },
          status: "OPEN",
        },
      });

      // Envoyer notifications (médecin + coordinateur)
      await sendAlertNotifications(vitalRecord, validationResult);
    }

    // Check thresholds personnalisés du patient (ancien système)
    await checkVitalThresholds(vitalRecord);

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient/history");

    return {
      success: true,
      message: "Constantes vitales enregistrées",
      vitalRecord,
      validationResult,
    };
  } catch (error: any) {
    console.error("Create vital record error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

export async function updateVitalRecord(
  vitalRecordId: string,
  patientId: string,
  formData: FormData
) {
  try {
    // Vérifier que l'enregistrement existe et appartient au patient
    const existingRecord = await prisma.vitalRecord.findFirst({
      where: {
        id: vitalRecordId,
        patientId,
      },
    });

    if (!existingRecord) {
      return {
        success: false,
        error: "Enregistrement non trouvé",
      };
    }

    // Vérifier que moins de 5 minutes se sont écoulées
    const now = new Date();
    const createdAt = new Date(existingRecord.createdAt);
    const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (minutesElapsed > 5) {
      return {
        success: false,
        error: "La période de modification (5 minutes) est expirée",
      };
    }

    const rawData = {
      systolicBP: formData.get("systolicBP") as string,
      diastolicBP: formData.get("diastolicBP") as string,
      heartRate: formData.get("heartRate") as string,
      temperature: formData.get("temperature") as string,
      oxygenSaturation: formData.get("oxygenSaturation") as string,
      weight: formData.get("weight") as string,
      notes: formData.get("notes") as string,
      recordedAt: formData.get("recordedAt") as string,
      symptoms: formData.get("symptoms") as string,
    };

    const validated = VitalRecordSchema.parse(rawData);

    // Convert string values to numbers
    const vitalData: any = {
      recordedAt: validated.recordedAt
        ? new Date(validated.recordedAt)
        : existingRecord.recordedAt,
    };

    if (validated.systolicBP)
      vitalData.systolicBP = parseFloat(validated.systolicBP.toString());
    if (validated.diastolicBP)
      vitalData.diastolicBP = parseFloat(validated.diastolicBP.toString());
    if (validated.heartRate)
      vitalData.heartRate = parseFloat(validated.heartRate.toString());
    if (validated.temperature)
      vitalData.temperature = parseFloat(validated.temperature.toString());
    if (validated.oxygenSaturation)
      vitalData.oxygenSaturation = parseFloat(validated.oxygenSaturation);
    if (validated.weight)
      vitalData.weight = parseFloat(validated.weight.toString());
    if (validated.notes !== undefined)
      vitalData.notes = validated.notes;
    if (validated.symptoms)
      vitalData.symptoms = JSON.parse(validated.symptoms);

    // Re-valider les signes vitaux contre les seuils
    let previousWeight;
    if (vitalData.weight) {
      const lastRecord = await prisma.vitalRecord.findFirst({
        where: {
          patientId,
          weight: { not: null },
          id: { not: vitalRecordId }, // Exclure l'enregistrement actuel
        },
        orderBy: { recordedAt: "desc" },
        select: { weight: true, recordedAt: true },
      });

      if (lastRecord && lastRecord.weight) {
        previousWeight = {
          weight: lastRecord.weight,
          recordedAt: lastRecord.recordedAt,
        };
      }
    }

    const validationResult = validateVitalSigns(
      {
        temperature: vitalData.temperature,
        systolicBP: vitalData.systolicBP,
        diastolicBP: vitalData.diastolicBP,
        heartRate: vitalData.heartRate,
        oxygenSaturation: vitalData.oxygenSaturation,
        weight: vitalData.weight,
      },
      previousWeight
    );

    vitalData.status = validationResult.status;
    vitalData.triggeredRules = validationResult.triggeredRules.length > 0
      ? validationResult.triggeredRules
      : undefined;

    // Mettre à jour l'enregistrement
    const updatedRecord = await prisma.vitalRecord.update({
      where: { id: vitalRecordId },
      data: vitalData,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    // Supprimer les anciennes alertes liées à cet enregistrement
    await prisma.alert.deleteMany({
      where: { vitalRecordId },
    });

    // Créer de nouvelles alertes si nécessaire
    if (validationResult.needsAlert && validationResult.alertSeverity) {
      const alertMessage = generateAlertMessage(validationResult.triggeredRules);

      await prisma.alert.create({
        data: {
          patientId,
          vitalRecordId: updatedRecord.id,
          alertType: "VITAL",
          severity: validationResult.alertSeverity,
          message: alertMessage,
          data: {
            triggeredRules: validationResult.triggeredRules,
            vitalValues: {
              temperature: vitalData.temperature,
              systolicBP: vitalData.systolicBP,
              diastolicBP: vitalData.diastolicBP,
              heartRate: vitalData.heartRate,
              oxygenSaturation: vitalData.oxygenSaturation,
              weight: vitalData.weight,
            },
          },
          status: "OPEN",
        },
      });

      // Envoyer notifications
      await sendAlertNotifications(updatedRecord, validationResult);
    }

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient/history");

    return {
      success: true,
      message: "Signes vitaux modifiés avec succès",
      vitalRecord: updatedRecord,
      validationResult,
    };
  } catch (error: any) {
    console.error("Update vital record error:", error);
    return { success: false, error: "Erreur lors de la modification" };
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
    await prisma.vitalRecord.delete({
      where: { id },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");

    return { success: true, message: "Enregistrement supprimé" };
  } catch (error) {
    console.error("Delete vital record error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
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
 * Récupérer tous les enregistrements de signes vitaux en attente de review
 */
export async function getPendingVitalRecords() {
  try {
    const records = await prisma.vitalRecord.findMany({
      where: {
        OR: [
          { status: "A_VERIFIER" },
          { status: "CRITIQUE" },
        ],
        reviewStatus: "PENDING",
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: "desc" }, // CRITIQUE avant A_VERIFIER
        { createdAt: "desc" },
      ],
    });

    return { success: true, records };
  } catch (error) {
    console.error("Get pending vital records error:", error);
    return { success: false, error: "Erreur lors de la récupération des enregistrements", records: [] };
  }
}

/**
 * Faire le review d'un enregistrement de signes vitaux
 */
export async function reviewVitalRecord(
  vitalRecordId: string,
  reviewedById: string,
  reviewNotes: string,
  newStatus: "NORMAL" | "A_VERIFIER" | "CRITIQUE"
) {
  try {
    // Vérifier que l'enregistrement existe
    const existingRecord = await prisma.vitalRecord.findUnique({
      where: { id: vitalRecordId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingRecord) {
      return { success: false, error: "Enregistrement non trouvé" };
    }

    // Mettre à jour l'enregistrement avec le review et le nouveau statut
    const updatedRecord = await prisma.vitalRecord.update({
      where: { id: vitalRecordId },
      data: {
        reviewStatus: "REVIEWED",
        reviewedById,
        reviewedAt: new Date(),
        reviewNotes,
        status: newStatus, // Mettre à jour le statut selon la décision du médecin
      },
      include: {
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/dashboard/doctor/alerts");
    revalidatePath(`/dashboard/patient/history`);
    revalidatePath("/dashboard/patient");
    revalidatePath(`/dashboard/doctor/patients/${existingRecord.patientId}`);

    return { success: true, record: updatedRecord };
  } catch (error) {
    console.error("Review vital record error:", error);
    return { success: false, error: "Erreur lors du review" };
  }
}

/**
 * Récupérer le dernier enregistrement de signes vitaux du patient
 */
export async function getLatestVitalRecord(patientId: string) {
  try {
    const record = await prisma.vitalRecord.findFirst({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
      include: {
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { success: true, record };
  } catch (error) {
    console.error("Get latest vital record error:", error);
    return { success: false, error: "Erreur lors de la récupération", record: null };
  }
}
