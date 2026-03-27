// MediFollow - Seuils des Signes Vitaux
// Thresholds Configuration for Vital Signs Monitoring
// Generated: March 4, 2026

export enum VitalStatus {
  NORMAL = "NORMAL",
  A_VERIFIER = "A_VERIFIER", // Warning - needs verification
  CRITIQUE = "CRITIQUE", // Critical - immediate action required
}

// ============================================
// TEMPÉRATURE (°C)
// ============================================
export const TEMPERATURE_THRESHOLDS = {
  CRITICAL_LOW: 35.0,    // Hypothermie sévère
  WARNING_LOW: 36.0,     // Hypothermie légère
  NORMAL_MIN: 36.1,      // Normal minimum
  NORMAL_MAX: 37.2,      // Normal maximum
  WARNING_HIGH: 38.5,    // Fièvre modérée - à vérifier
  CRITICAL_HIGH: 39.5,   // Fièvre sévère - critique
};

// ============================================
// PRESSION ARTÉRIELLE (mmHg)
// ============================================
export const BLOOD_PRESSURE_THRESHOLDS = {
  SYSTOLIC: {
    CRITICAL_LOW: 80,    // Hypotension sévère
    WARNING_LOW: 90,     // Hypotension légère
    NORMAL_MIN: 90,      // Normal minimum
    NORMAL_MAX: 140,     // Normal maximum
    WARNING_HIGH: 160,   // Hypertension modérée - à vérifier
    CRITICAL_HIGH: 180,  // Hypertension sévère - critique
  },
  DIASTOLIC: {
    CRITICAL_LOW: 40,    // Hypotension sévère
    WARNING_LOW: 60,     // Hypotension légère
    NORMAL_MIN: 60,      // Normal minimum
    NORMAL_MAX: 90,      // Normal maximum
    WARNING_HIGH: 100,   // Hypertension modérée - à vérifier
    CRITICAL_HIGH: 120,  // Hypertension sévère - critique
  },
};

// ============================================
// FRÉQUENCE CARDIAQUE (bpm)
// ============================================
export const HEART_RATE_THRESHOLDS = {
  CRITICAL_LOW: 40,      // Bradycardie sévère
  WARNING_LOW: 50,       // Bradycardie légère
  NORMAL_MIN: 60,        // Normal minimum
  NORMAL_MAX: 100,       // Normal maximum
  WARNING_HIGH: 110,     // Tachycardie modérée - à vérifier
  CRITICAL_HIGH: 130,    // Tachycardie sévère - critique
};

// ============================================
// SATURATION EN OXYGÈNE (%)
// ============================================
export const OXYGEN_SATURATION_THRESHOLDS = {
  CRITICAL_LOW: 88,      // Hypoxémie sévère - critique
  WARNING_LOW: 92,       // Hypoxémie légère - à vérifier
  NORMAL_MIN: 95,        // Normal minimum
  NORMAL_MAX: 100,       // Normal maximum
};

// ============================================
// POIDS (kg)
// ============================================
export const WEIGHT_THRESHOLDS = {
  // Changement de poids par rapport à la dernière mesure
  WARNING_GAIN_KG: 2.0,      // Gain de 2kg+ en une semaine - à vérifier
  CRITICAL_GAIN_KG: 3.0,     // Gain de 3kg+ en une semaine - critique
  WARNING_LOSS_KG: 2.0,      // Perte de 2kg+ en une semaine - à vérifier
  CRITICAL_LOSS_KG: 3.0,     // Perte de 3kg+ en une semaine - critique
  
  // Poids absolu (pour détection d'erreurs de saisie)
  MIN_VALID_WEIGHT: 20,      // Minimum valid weight
  MAX_VALID_WEIGHT: 300,     // Maximum valid weight
};

// ============================================
// TYPES D'ALERTES
// ============================================
export enum AlertRuleType {
  // Température
  TEMP_CRITICAL_LOW = "TEMPERATURE_CRITIQUE_BASSE",
  TEMP_WARNING_LOW = "TEMPERATURE_BASSE",
  TEMP_WARNING_HIGH = "TEMPERATURE_ELEVEE",
  TEMP_CRITICAL_HIGH = "TEMPERATURE_CRITIQUE_HAUTE",
  
  // Pression artérielle - Systolique
  BP_SYS_CRITICAL_LOW = "TENSION_SYSTOLIQUE_CRITIQUE_BASSE",
  BP_SYS_WARNING_LOW = "TENSION_SYSTOLIQUE_BASSE",
  BP_SYS_WARNING_HIGH = "TENSION_SYSTOLIQUE_ELEVEE",
  BP_SYS_CRITICAL_HIGH = "TENSION_SYSTOLIQUE_CRITIQUE_HAUTE",
  
  // Pression artérielle - Diastolique
  BP_DIA_CRITICAL_LOW = "TENSION_DIASTOLIQUE_CRITIQUE_BASSE",
  BP_DIA_WARNING_LOW = "TENSION_DIASTOLIQUE_BASSE",
  BP_DIA_WARNING_HIGH = "TENSION_DIASTOLIQUE_ELEVEE",
  BP_DIA_CRITICAL_HIGH = "TENSION_DIASTOLIQUE_CRITIQUE_HAUTE",
  
  // Fréquence cardiaque
  HR_CRITICAL_LOW = "FREQUENCE_CARDIAQUE_CRITIQUE_BASSE",
  HR_WARNING_LOW = "FREQUENCE_CARDIAQUE_BASSE",
  HR_WARNING_HIGH = "FREQUENCE_CARDIAQUE_ELEVEE",
  HR_CRITICAL_HIGH = "FREQUENCE_CARDIAQUE_CRITIQUE_HAUTE",
  
  // Saturation en oxygène
  SPO2_CRITICAL_LOW = "SATURATION_OXYGENE_CRITIQUE",
  SPO2_WARNING_LOW = "SATURATION_OXYGENE_BASSE",
  
  // Poids
  WEIGHT_WARNING_GAIN = "PRISE_POIDS_RAPIDE",
  WEIGHT_CRITICAL_GAIN = "PRISE_POIDS_CRITIQUE",
  WEIGHT_WARNING_LOSS = "PERTE_POIDS_RAPIDE",
  WEIGHT_CRITICAL_LOSS = "PERTE_POIDS_CRITIQUE",
}

// ============================================
// MESSAGES D'ALERTE
// ============================================
export const ALERT_MESSAGES: Record<AlertRuleType, string> = {
  // Température
  [AlertRuleType.TEMP_CRITICAL_LOW]: "Température critique basse (hypothermie sévère)",
  [AlertRuleType.TEMP_WARNING_LOW]: "Température basse (hypothermie légère)",
  [AlertRuleType.TEMP_WARNING_HIGH]: "Température élevée (fièvre modérée)",
  [AlertRuleType.TEMP_CRITICAL_HIGH]: "Température critique haute (fièvre sévère)",
  
  // Pression artérielle - Systolique
  [AlertRuleType.BP_SYS_CRITICAL_LOW]: "Tension systolique critique basse (hypotension sévère)",
  [AlertRuleType.BP_SYS_WARNING_LOW]: "Tension systolique basse (hypotension)",
  [AlertRuleType.BP_SYS_WARNING_HIGH]: "Tension systolique élevée (hypertension modérée)",
  [AlertRuleType.BP_SYS_CRITICAL_HIGH]: "Tension systolique critique haute (hypertension sévère)",
  
  // Pression artérielle - Diastolique
  [AlertRuleType.BP_DIA_CRITICAL_LOW]: "Tension diastolique critique basse (hypotension sévère)",
  [AlertRuleType.BP_DIA_WARNING_LOW]: "Tension diastolique basse (hypotension)",
  [AlertRuleType.BP_DIA_WARNING_HIGH]: "Tension diastolique élevée (hypertension modérée)",
  [AlertRuleType.BP_DIA_CRITICAL_HIGH]: "Tension diastolique critique haute (hypertension sévère)",
  
  // Fréquence cardiaque
  [AlertRuleType.HR_CRITICAL_LOW]: "Fréquence cardiaque critique basse (bradycardie sévère)",
  [AlertRuleType.HR_WARNING_LOW]: "Fréquence cardiaque basse (bradycardie)",
  [AlertRuleType.HR_WARNING_HIGH]: "Fréquence cardiaque élevée (tachycardie modérée)",
  [AlertRuleType.HR_CRITICAL_HIGH]: "Fréquence cardiaque critique haute (tachycardie sévère)",
  
  // Saturation en oxygène
  [AlertRuleType.SPO2_CRITICAL_LOW]: "Saturation en oxygène critique (hypoxémie sévère)",
  [AlertRuleType.SPO2_WARNING_LOW]: "Saturation en oxygène basse (hypoxémie)",
  
  // Poids
  [AlertRuleType.WEIGHT_WARNING_GAIN]: "Prise de poids rapide détectée",
  [AlertRuleType.WEIGHT_CRITICAL_GAIN]: "Prise de poids critique en peu de temps",
  [AlertRuleType.WEIGHT_WARNING_LOSS]: "Perte de poids rapide détectée",
  [AlertRuleType.WEIGHT_CRITICAL_LOSS]: "Perte de poids critique en peu de temps",
};

// ============================================
// INTERFACE POUR LES RÈGLES DÉCLENCHÉES
// ============================================
export interface TriggeredRule {
  rule: AlertRuleType;
  message: string;
  value: number;
  threshold: number;
  severity: "WARNING" | "CRITICAL";
}

// ============================================
// RÉSULTAT DE VALIDATION
// ============================================
export interface VitalValidationResult {
  status: VitalStatus;
  triggeredRules: TriggeredRule[];
  needsAlert: boolean;
  alertSeverity?: "MEDIUM" | "HIGH" | "CRITICAL";
}
