/**
 * MediFollow - Alert Actions
 * Server actions for alert management
 */

"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getVitalStatus } from "@/lib/utils";
import {
  AlertType,
  AlertSeverity,
  AlertStatus,
} from "@/types/medifollow.types";
import { AuditService } from "@/lib/services/audit.service";

export async function checkVitalThresholds(vitalRecord: any) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: vitalRecord.patientId },
      include: { user: true },
    });

    if (!patient || !patient.vitalThresholds) {
      return;
    }

    const alerts = [];

    // Check systolic BP
    if (vitalRecord.systolicBP && patient.vitalThresholds.systolicBP) {
      const status = getVitalStatus(
        vitalRecord.systolicBP,
        patient.vitalThresholds.systolicBP.min,
        patient.vitalThresholds.systolicBP.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Pression systolique critique: ${vitalRecord.systolicBP} mmHg`,
          data: {
            vitalType: "systolicBP",
            value: vitalRecord.systolicBP,
            threshold: patient.vitalThresholds.systolicBP,
            vitalRecordId: vitalRecord.id,
          },
        });
      } else if (status === "warning") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.MEDIUM,
          message: `Pression systolique anormale: ${vitalRecord.systolicBP} mmHg`,
          data: {
            vitalType: "systolicBP",
            value: vitalRecord.systolicBP,
            threshold: patient.vitalThresholds.systolicBP,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check diastolic BP
    if (vitalRecord.diastolicBP && patient.vitalThresholds.diastolicBP) {
      const status = getVitalStatus(
        vitalRecord.diastolicBP,
        patient.vitalThresholds.diastolicBP.min,
        patient.vitalThresholds.diastolicBP.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Pression diastolique critique: ${vitalRecord.diastolicBP} mmHg`,
          data: {
            vitalType: "diastolicBP",
            value: vitalRecord.diastolicBP,
            threshold: patient.vitalThresholds.diastolicBP,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check heart rate
    if (vitalRecord.heartRate && patient.vitalThresholds.heartRate) {
      const status = getVitalStatus(
        vitalRecord.heartRate,
        patient.vitalThresholds.heartRate.min,
        patient.vitalThresholds.heartRate.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Fréquence cardiaque critique: ${vitalRecord.heartRate} bpm`,
          data: {
            vitalType: "heartRate",
            value: vitalRecord.heartRate,
            threshold: patient.vitalThresholds.heartRate,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check temperature
    if (vitalRecord.temperature && patient.vitalThresholds.temperature) {
      const status = getVitalStatus(
        vitalRecord.temperature,
        patient.vitalThresholds.temperature.min,
        patient.vitalThresholds.temperature.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.HIGH,
          message: `Température anormale: ${vitalRecord.temperature}°C`,
          data: {
            vitalType: "temperature",
            value: vitalRecord.temperature,
            threshold: patient.vitalThresholds.temperature,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check oxygen saturation
    if (
      vitalRecord.oxygenSaturation &&
      patient.vitalThresholds.oxygenSaturation
    ) {
      const status = getVitalStatus(
        vitalRecord.oxygenSaturation,
        patient.vitalThresholds.oxygenSaturation.min,
        patient.vitalThresholds.oxygenSaturation.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Saturation en oxygène critique: ${vitalRecord.oxygenSaturation}%`,
          data: {
            vitalType: "oxygenSaturation",
            value: vitalRecord.oxygenSaturation,
            threshold: patient.vitalThresholds.oxygenSaturation,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Create alerts
    if (alerts.length > 0) {
      await prisma.alert.createMany({
        data: alerts,
      });
    }

    return { success: true, alertsCreated: alerts.length };
  } catch (error) {
    console.error("Check vital thresholds error:", error);
    return {
      success: false,
      error: "Erreur lors de la vérification des seuils",
    };
  }
}

export async function getPatientAlerts(
  patientId: string,
  status?: AlertStatus
) {
  try {
    const where: any = { patientId };
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    return { success: true, alerts };
  } catch (error) {
    console.error("Get patient alerts error:", error);
    return { success: false, error: "Erreur", alerts: [] };
  }
}

export async function getAllAlerts(status?: AlertStatus) {
  try {
    const where: any = {};
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: { user: true },
        },
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });

    return { success: true, alerts };
  } catch (error) {
    console.error("Get all alerts error:", error);
    return { success: false, error: "Erreur", alerts: [] };
  }
}

export async function acknowledgeAlert(alertId: string, userId: string) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedById: userId,
        acknowledgedAt: new Date(),
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    // Log the acknowledge action to audit log
    await AuditService.logAcknowledgeAlert(userId, alertId);
    console.log("📝 [ACKNOWLEDGE_ALERT] Audit log created for alert:", alertId);

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient");

    return { success: true, message: "Alerte prise en compte", alert };
  } catch (error) {
    console.error("Acknowledge alert error:", error);
    return { success: false, error: "Erreur" };
  }
}

export async function resolveAlert(
  alertId: string,
  userId: string,
  resolution: string
) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedById: userId,
        resolvedAt: new Date(),
        resolution,
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    // Log the resolve action to audit log
    await AuditService.logResolveAlert(userId, alertId, resolution);
    console.log("📝 [RESOLVE_ALERT] Audit log created for alert:", alertId);

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient");

    return { success: true, message: "Alerte résolue", alert };
  } catch (error) {
    console.error("Resolve alert error:", error);
    return { success: false, error: "Erreur" };
  }
}

export async function createAlert(
  patientId: string,
  alertType: string,
  severity: string,
  message: string,
  data?: any
) {
  try {
    const alert = await prisma.alert.create({
      data: {
        patientId,
        alertType: alertType as any,
        severity: severity as any,
        message,
        data: data || {},
        status: AlertStatus.OPEN,
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    // Log the create action to audit log
    try {
      await AuditService.logCreateAlert(alert.patient.userId, alert.id, {
        alertType,
        severity,
        message,
        patientId,
      });
      console.log("📝 [CREATE_ALERT] Audit log created for alert:", alert.id);
    } catch (auditError) {
      console.error("Error creating audit log for alert:", auditError);
      // Don't fail the alert creation if audit logging fails
    }

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient");

    return { success: true, message: "Alerte créée", alert };
  } catch (error) {
    console.error("Create alert error:", error);
    return { success: false, error: "Erreur lors de la création de l'alerte" };
  }
}

export async function getAlertStats() {
  try {
    const total = await prisma.alert.count();
    const open = await prisma.alert.count({
      where: { status: AlertStatus.OPEN },
    });
    const acknowledged = await prisma.alert.count({
      where: { status: AlertStatus.ACKNOWLEDGED },
    });
    const resolved = await prisma.alert.count({
      where: { status: AlertStatus.RESOLVED },
    });
    const critical = await prisma.alert.count({
      where: { severity: AlertSeverity.CRITICAL },
    });

    return {
      success: true,
      stats: { total, open, acknowledged, resolved, critical },
    };
  } catch (error) {
    console.error("Get alert stats error:", error);
    return { success: false, error: "Erreur", stats: null };
  }
}

/**
 * Get alerts filtered by doctor's specialty
 * Only shows alerts for patients whose diagnosis matches the doctor's specialty
 */
export async function getAlertsByDoctorSpecialty(
  doctorUserId: string,
  status?: AlertStatus
) {
  try {
    // Get patients via AccessGrants (doctor has explicit access to these patients)
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        doctorId: doctorUserId,
        isActive: true,
      },
      select: {
        patientId: true,
      },
    });

    const patientIds = accessGrants.map((grant) => grant.patientId);

    // Build where clause for alerts
    const where: any = {
      OR: [
        // 1. Alerts from patients with explicit AccessGrant from this doctor
        { patientId: { in: patientIds } },
        // 2. Alerts from patients whose diagnosis matches doctor specialty (legacy support)
        {
          patient: {
            diagnosis: {
              contains: "CARDIOLOGY",
              mode: "insensitive",
            },
          },
        },
      ],
    };

    if (status) {
      where.status = status;
    }

    const alerts = await prisma.alert.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: { user: true },
        },
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });

    return { success: true, alerts };
  } catch (error) {
    console.error("Get alerts by doctor specialty error:", error);
    return { success: false, error: "Erreur", alerts: [] };
  }
}

/**
 * Get alerts stats filtered by doctor's specialty
 */
export async function getAlertStatsByDoctorSpecialty(doctorUserId: string) {
  try {
    // Get patients via AccessGrants (doctor has explicit access to these patients)
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        doctorId: doctorUserId,
        isActive: true,
      },
      select: {
        patientId: true,
      },
    });

    const patientIds = accessGrants.map((grant) => grant.patientId);

    // Build where clause for alerts
    const where: any = {
      OR: [
        // 1. Alerts from patients with explicit AccessGrant from this doctor
        { patientId: { in: patientIds } },
        // 2. Alerts from patients whose diagnosis matches doctor specialty (legacy support)
        {
          patient: {
            diagnosis: {
              contains: "CARDIOLOGY",
              mode: "insensitive",
            },
          },
        },
      ],
    };

    const total = await prisma.alert.count({ where });
    const open = await prisma.alert.count({
      where: { ...where, status: AlertStatus.OPEN } as any,
    });
    const acknowledged = await prisma.alert.count({
      where: { ...where, status: AlertStatus.ACKNOWLEDGED } as any,
    });
    const resolved = await prisma.alert.count({
      where: { ...where, status: AlertStatus.RESOLVED } as any,
    });
    const critical = await prisma.alert.count({
      where: { ...where, severity: AlertSeverity.CRITICAL } as any,
    });

    return {
      success: true,
      stats: { total, open, acknowledged, resolved, critical },
    };
  } catch (error) {
    console.error("Get alert stats by doctor specialty error:", error);
    return { success: false, error: "Erreur", stats: null };
  }
}

/**
 * Get a single alert by ID
 */
export async function getAlertById(id: string) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: true },
        },
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });

    if (!alert) {
      return { success: false, error: "Alerte non trouvée", alert: null };
    }

    return { success: true, alert };
  } catch (error) {
    console.error("Get alert by ID error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'alerte",
      alert: null,
    };
  }
}

/**
 * Update alert status
 */
export async function updateAlertStatus(id: string, status: string) {
  try {
    const validStatuses = [
      AlertStatus.OPEN,
      AlertStatus.ACKNOWLEDGED,
      AlertStatus.RESOLVED,
    ];

    if (!validStatuses.includes(status as any)) {
      return { success: false, error: "Statut invalide" };
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: status as any,
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/doctor");

    return { success: true, alert, message: "Statut de l'alerte mis à jour" };
  } catch (error) {
    console.error("Update alert status error:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}
