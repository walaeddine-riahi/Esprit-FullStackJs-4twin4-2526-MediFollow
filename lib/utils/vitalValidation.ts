// MediFollow - Validation des Signes Vitaux
// Vital Signs Threshold Validation Logic
// Generated: March 4, 2026

import {
  VitalStatus,
  AlertRuleType,
  TriggeredRule,
  VitalValidationResult,
  TEMPERATURE_THRESHOLDS,
  BLOOD_PRESSURE_THRESHOLDS,
  HEART_RATE_THRESHOLDS,
  OXYGEN_SATURATION_THRESHOLDS,
  WEIGHT_THRESHOLDS,
  ALERT_MESSAGES,
} from "@/constants/thresholds";

interface VitalData {
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  weight?: number;
}

interface PreviousWeight {
  weight: number;
  recordedAt: Date;
}

/**
 * Valide les signes vitaux contre les seuils définis
 * et détermine le statut et les règles déclenchées
 */
export function validateVitalSigns(
  vitals: VitalData,
  previousWeight?: PreviousWeight
): VitalValidationResult {
  const triggeredRules: TriggeredRule[] = [];

  // ============================================
  // VALIDATION TEMPÉRATURE
  // ============================================
  if (vitals.temperature !== undefined) {
    const temp = vitals.temperature;

    if (temp <= TEMPERATURE_THRESHOLDS.CRITICAL_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.TEMP_CRITICAL_LOW,
        message: ALERT_MESSAGES[AlertRuleType.TEMP_CRITICAL_LOW],
        value: temp,
        threshold: TEMPERATURE_THRESHOLDS.CRITICAL_LOW,
        severity: "CRITICAL",
      });
    } else if (temp < TEMPERATURE_THRESHOLDS.WARNING_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.TEMP_WARNING_LOW,
        message: ALERT_MESSAGES[AlertRuleType.TEMP_WARNING_LOW],
        value: temp,
        threshold: TEMPERATURE_THRESHOLDS.WARNING_LOW,
        severity: "WARNING",
      });
    } else if (temp >= TEMPERATURE_THRESHOLDS.CRITICAL_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.TEMP_CRITICAL_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.TEMP_CRITICAL_HIGH],
        value: temp,
        threshold: TEMPERATURE_THRESHOLDS.CRITICAL_HIGH,
        severity: "CRITICAL",
      });
    } else if (temp > TEMPERATURE_THRESHOLDS.WARNING_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.TEMP_WARNING_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.TEMP_WARNING_HIGH],
        value: temp,
        threshold: TEMPERATURE_THRESHOLDS.WARNING_HIGH,
        severity: "WARNING",
      });
    }
  }

  // ============================================
  // VALIDATION PRESSION ARTÉRIELLE - SYSTOLIQUE
  // ============================================
  if (vitals.systolicBP !== undefined) {
    const sys = vitals.systolicBP;

    if (sys <= BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.CRITICAL_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.BP_SYS_CRITICAL_LOW,
        message: ALERT_MESSAGES[AlertRuleType.BP_SYS_CRITICAL_LOW],
        value: sys,
        threshold: BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.CRITICAL_LOW,
        severity: "CRITICAL",
      });
    } else if (sys < BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.WARNING_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.BP_SYS_WARNING_LOW,
        message: ALERT_MESSAGES[AlertRuleType.BP_SYS_WARNING_LOW],
        value: sys,
        threshold: BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.WARNING_LOW,
        severity: "WARNING",
      });
    } else if (sys >= BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.CRITICAL_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.BP_SYS_CRITICAL_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.BP_SYS_CRITICAL_HIGH],
        value: sys,
        threshold: BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.CRITICAL_HIGH,
        severity: "CRITICAL",
      });
    } else if (sys > BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.WARNING_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.BP_SYS_WARNING_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.BP_SYS_WARNING_HIGH],
        value: sys,
        threshold: BLOOD_PRESSURE_THRESHOLDS.SYSTOLIC.WARNING_HIGH,
        severity: "WARNING",
      });
    }
  }

  // ============================================
  // VALIDATION PRESSION ARTÉRIELLE - DIASTOLIQUE
  // ============================================
  if (vitals.diastolicBP !== undefined) {
    const dia = vitals.diastolicBP;

    if (dia <= BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.CRITICAL_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.BP_DIA_CRITICAL_LOW,
        message: ALERT_MESSAGES[AlertRuleType.BP_DIA_CRITICAL_LOW],
        value: dia,
        threshold: BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.CRITICAL_LOW,
        severity: "CRITICAL",
      });
    } else if (dia < BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.WARNING_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.BP_DIA_WARNING_LOW,
        message: ALERT_MESSAGES[AlertRuleType.BP_DIA_WARNING_LOW],
        value: dia,
        threshold: BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.WARNING_LOW,
        severity: "WARNING",
      });
    } else if (dia >= BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.CRITICAL_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.BP_DIA_CRITICAL_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.BP_DIA_CRITICAL_HIGH],
        value: dia,
        threshold: BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.CRITICAL_HIGH,
        severity: "CRITICAL",
      });
    } else if (dia > BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.WARNING_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.BP_DIA_WARNING_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.BP_DIA_WARNING_HIGH],
        value: dia,
        threshold: BLOOD_PRESSURE_THRESHOLDS.DIASTOLIC.WARNING_HIGH,
        severity: "WARNING",
      });
    }
  }

  // ============================================
  // VALIDATION FRÉQUENCE CARDIAQUE
  // ============================================
  if (vitals.heartRate !== undefined) {
    const hr = vitals.heartRate;

    if (hr <= HEART_RATE_THRESHOLDS.CRITICAL_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.HR_CRITICAL_LOW,
        message: ALERT_MESSAGES[AlertRuleType.HR_CRITICAL_LOW],
        value: hr,
        threshold: HEART_RATE_THRESHOLDS.CRITICAL_LOW,
        severity: "CRITICAL",
      });
    } else if (hr < HEART_RATE_THRESHOLDS.WARNING_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.HR_WARNING_LOW,
        message: ALERT_MESSAGES[AlertRuleType.HR_WARNING_LOW],
        value: hr,
        threshold: HEART_RATE_THRESHOLDS.WARNING_LOW,
        severity: "WARNING",
      });
    } else if (hr >= HEART_RATE_THRESHOLDS.CRITICAL_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.HR_CRITICAL_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.HR_CRITICAL_HIGH],
        value: hr,
        threshold: HEART_RATE_THRESHOLDS.CRITICAL_HIGH,
        severity: "CRITICAL",
      });
    } else if (hr > HEART_RATE_THRESHOLDS.WARNING_HIGH) {
      triggeredRules.push({
        rule: AlertRuleType.HR_WARNING_HIGH,
        message: ALERT_MESSAGES[AlertRuleType.HR_WARNING_HIGH],
        value: hr,
        threshold: HEART_RATE_THRESHOLDS.WARNING_HIGH,
        severity: "WARNING",
      });
    }
  }

  // ============================================
  // VALIDATION SATURATION EN OXYGÈNE
  // ============================================
  if (vitals.oxygenSaturation !== undefined) {
    const spo2 = vitals.oxygenSaturation;

    if (spo2 <= OXYGEN_SATURATION_THRESHOLDS.CRITICAL_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.SPO2_CRITICAL_LOW,
        message: ALERT_MESSAGES[AlertRuleType.SPO2_CRITICAL_LOW],
        value: spo2,
        threshold: OXYGEN_SATURATION_THRESHOLDS.CRITICAL_LOW,
        severity: "CRITICAL",
      });
    } else if (spo2 < OXYGEN_SATURATION_THRESHOLDS.WARNING_LOW) {
      triggeredRules.push({
        rule: AlertRuleType.SPO2_WARNING_LOW,
        message: ALERT_MESSAGES[AlertRuleType.SPO2_WARNING_LOW],
        value: spo2,
        threshold: OXYGEN_SATURATION_THRESHOLDS.WARNING_LOW,
        severity: "WARNING",
      });
    }
  }

  // ============================================
  // VALIDATION POIDS (changement rapide)
  // ============================================
  if (vitals.weight !== undefined && previousWeight) {
    const currentWeight = vitals.weight;
    const prevWeight = previousWeight.weight;
    const weightChange = currentWeight - prevWeight;
    
    // Calculer la différence en jours
    const daysDiff = Math.max(
      1,
      (Date.now() - previousWeight.recordedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Ne vérifier que si la mesure précédente est dans les 14 derniers jours
    if (daysDiff <= 14) {
      // Gain de poids
      if (weightChange >= WEIGHT_THRESHOLDS.CRITICAL_GAIN_KG) {
        triggeredRules.push({
          rule: AlertRuleType.WEIGHT_CRITICAL_GAIN,
          message: `${ALERT_MESSAGES[AlertRuleType.WEIGHT_CRITICAL_GAIN]} (+${weightChange.toFixed(1)}kg en ${Math.round(daysDiff)} jours)`,
          value: currentWeight,
          threshold: prevWeight + WEIGHT_THRESHOLDS.CRITICAL_GAIN_KG,
          severity: "CRITICAL",
        });
      } else if (weightChange >= WEIGHT_THRESHOLDS.WARNING_GAIN_KG) {
        triggeredRules.push({
          rule: AlertRuleType.WEIGHT_WARNING_GAIN,
          message: `${ALERT_MESSAGES[AlertRuleType.WEIGHT_WARNING_GAIN]} (+${weightChange.toFixed(1)}kg en ${Math.round(daysDiff)} jours)`,
          value: currentWeight,
          threshold: prevWeight + WEIGHT_THRESHOLDS.WARNING_GAIN_KG,
          severity: "WARNING",
        });
      }
      
      // Perte de poids
      if (weightChange <= -WEIGHT_THRESHOLDS.CRITICAL_LOSS_KG) {
        triggeredRules.push({
          rule: AlertRuleType.WEIGHT_CRITICAL_LOSS,
          message: `${ALERT_MESSAGES[AlertRuleType.WEIGHT_CRITICAL_LOSS]} (${weightChange.toFixed(1)}kg en ${Math.round(daysDiff)} jours)`,
          value: currentWeight,
          threshold: prevWeight - WEIGHT_THRESHOLDS.CRITICAL_LOSS_KG,
          severity: "CRITICAL",
        });
      } else if (weightChange <= -WEIGHT_THRESHOLDS.WARNING_LOSS_KG) {
        triggeredRules.push({
          rule: AlertRuleType.WEIGHT_WARNING_LOSS,
          message: `${ALERT_MESSAGES[AlertRuleType.WEIGHT_WARNING_LOSS]} (${weightChange.toFixed(1)}kg en ${Math.round(daysDiff)} jours)`,
          value: currentWeight,
          threshold: prevWeight - WEIGHT_THRESHOLDS.WARNING_LOSS_KG,
          severity: "WARNING",
        });
      }
    }
  }

  // ============================================
  // DÉTERMINER LE STATUT GLOBAL
  // ============================================
  let status = VitalStatus.NORMAL;
  let alertSeverity: "MEDIUM" | "HIGH" | "CRITICAL" | undefined;

  const hasCritical = triggeredRules.some((r) => r.severity === "CRITICAL");
  const hasWarning = triggeredRules.some((r) => r.severity === "WARNING");

  if (hasCritical) {
    status = VitalStatus.CRITIQUE;
    alertSeverity = "CRITICAL";
  } else if (hasWarning) {
    status = VitalStatus.A_VERIFIER;
    alertSeverity = hasWarning ? "MEDIUM" : "HIGH";
  }

  return {
    status,
    triggeredRules,
    needsAlert: triggeredRules.length > 0,
    alertSeverity,
  };
}

/**
 * Génère un message d'alerte lisible à partir des règles déclenchées
 */
export function generateAlertMessage(triggeredRules: TriggeredRule[]): string {
  if (triggeredRules.length === 0) return "";

  if (triggeredRules.length === 1) {
    return triggeredRules[0].message;
  }

  const criticalRules = triggeredRules.filter((r) => r.severity === "CRITICAL");
  const warningRules = triggeredRules.filter((r) => r.severity === "WARNING");

  let message = "Plusieurs anomalies détectées:\n";

  if (criticalRules.length > 0) {
    message += "\nCRITIQUE:\n";
    criticalRules.forEach((r) => {
      message += `- ${r.message}\n`;
    });
  }

  if (warningRules.length > 0) {
    message += "\nÀ VÉRIFIER:\n";
    warningRules.forEach((r) => {
      message += `- ${r.message}\n`;
    });
  }

  return message.trim();
}
