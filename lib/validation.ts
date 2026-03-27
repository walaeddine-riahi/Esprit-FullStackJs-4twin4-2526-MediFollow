/**
 * MediFollow - Zod Validation Schemas
 * All form validation schemas for the platform
 */

import { z } from "zod";

import { Severity } from "@/types/medifollow.types";

// ============================================
// AUTH VALIDATION
// ============================================

export const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[a-z]/, "Au moins une minuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[@$!%*?&]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ============================================
// VITAL RECORD VALIDATION
// ============================================

export const VitalRecordSchema = z.object({
  // Constantes vitales obligatoires
  temperature: z.coerce
    .number()
    .min(34, "La température doit être au moins 34°C")
    .max(42, "La température ne peut pas dépasser 42°C"),
  systolicBP: z.coerce
    .number()
    .min(70, "La pression systolique doit être au moins 70")
    .max(250, "La pression systolique ne peut pas dépasser 250"),
  diastolicBP: z.coerce
    .number()
    .min(40, "La pression diastolique doit être au moins 40")
    .max(150, "La pression diastolique ne peut pas dépasser 150"),
  heartRate: z.coerce
    .number()
    .min(30, "La fréquence cardiaque doit être au moins 30 bpm")
    .max(220, "La fréquence cardiaque ne peut pas dépasser 220 bpm"),
  weight: z.coerce
    .number()
    .min(20, "Le poids doit être au moins 20 kg")
    .max(300, "Le poids ne peut pas dépasser 300 kg"),
  // Optionnels
  oxygenSaturation: z.string().optional(),
  notes: z.string().max(500).optional(),
  recordedAt: z.string().optional(),
  // Symptômes
  symptoms: z.string().optional(), // JSON stringifié
});

// ============================================
// SYMPTOM VALIDATION
// ============================================

export const SymptomSchema = z.object({
  symptomType: z.string().min(3, "Type de symptôme requis"),
  severity: z.nativeEnum(Severity),
  description: z.string().min(10, "Description requise").max(1000),
  occurredAt: z.string().optional(),
});

// ============================================
// APPOINTMENT VALIDATION
// ============================================

export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Sélectionnez au moins un médecin"),
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "La raison doit contenir au moins 2 caractères")
    .max(500, "La raison doit contenir au maximum 500 caractères"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Sélectionnez au moins un médecin"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Sélectionnez au moins un médecin"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "La raison doit contenir au moins 2 caractères")
    .max(500, "La raison doit contenir au maximum 500 caractères"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type VitalRecordFormValues = z.infer<typeof VitalRecordSchema>;
export type SymptomFormValues = z.infer<typeof SymptomSchema>;
export type CreateAppointmentFormValues = z.infer<typeof CreateAppointmentSchema>;
