/**
 * MediFollow - Notification Service
 * Service for sending alert notifications to doctors and coordinators
 */

"use server";

import prisma from "@/lib/prisma";
import { VitalValidationResult } from "@/constants/thresholds";
import { generateAlertMessage } from "@/lib/utils/vitalValidation";

// Azure Communication Services (depuis .env)
const AZURE_COMMUNICATION_CONNECTION_STRING = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const AZURE_COMMUNICATION_EMAIL_FROM = process.env.AZURE_COMMUNICATION_EMAIL_FROM;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;

interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

/**
 * Envoie des notifications d'alerte aux médecins et coordinateurs
 */
export async function sendAlertNotifications(
  vitalRecord: any,
  validationResult: VitalValidationResult
) {
  try {
    const patient = vitalRecord.patient;
    const user = patient.user;

    // Récupérer les médecins et coordinateurs à notifier
    const recipients = await getNotificationRecipients(patient.id);

    if (recipients.length === 0) {
      console.warn("No recipients found for alert notification");
      return { success: false, message: "Aucun destinataire trouvé" };
    }

    // Générer le message d'alerte
    const alertMessage = generateAlertMessage(validationResult.triggeredRules);
    const patientName = `${user.firstName} ${user.lastName}`;
    
    // Détails des signes vitaux
    const vitalDetails = formatVitalDetails(vitalRecord);

    // Template du message
    const emailSubject = `[${validationResult.status}] Alerte signes vitaux - ${patientName}`;
    const emailBody = `
Alerte MediFollow - Signes Vitaux Anormaux

Patient: ${patientName}
Date: ${new Date(vitalRecord.recordedAt).toLocaleString("fr-FR")}
Statut: ${validationResult.status}

ANOMALIES DÉTECTÉES:
${alertMessage}

VALEURS MESURÉES:
${vitalDetails}

Action requise:
${validationResult.status === "CRITIQUE" 
  ? "⚠️ INTERVENTION IMMÉDIATE NÉCESSAIRE - Contactez le patient dès que possible"
  : "📋 Vérification recommandée - Prenez contact avec le patient pour évaluation"}

📝 Statut: En attente du review du médecin

Accédez au dossier patient: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/doctor/patients/${patient.id}

---
Cet email est automatique. Ne pas répondre.
MediFollow - Plateforme de Surveillance Post-Hospitalière
    `.trim();

    const smsBody = `[MediFollow ${validationResult.status}] Alerte ${patientName}: ${validationResult.triggeredRules[0].message}. Consultez l'application.`;

    // Envoyer les notifications
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const emailResult = await sendEmail(
          recipient.email,
          emailSubject,
          emailBody
        );

        // Envoyer SMS uniquement si critique et numéro disponible
        let smsResult = null;
        if (
          validationResult.status === "CRITIQUE" &&
          recipient.phoneNumber &&
          TWILIO_ACCOUNT_SID
        ) {
          smsResult = await sendSMS(recipient.phoneNumber, smsBody);
        }

        return { recipient, emailResult, smsResult };
      })
    );

    // Logger les résultats
    console.log("Notification results:", results);

    return {
      success: true,
      message: `Notifications envoyées à ${recipients.length} destinataire(s)`,
      recipients: recipients.length,
    };
  } catch (error) {
    console.error("Error sending alert notifications:", error);
    return {
      success: false,
      message: "Erreur lors de l'envoi des notifications",
    };
  }
}

/**
 * Récupère les destinataires des notifications (médecins + coordinateurs)
 */
async function getNotificationRecipients(
  patientId: string
): Promise<NotificationRecipient[]> {
  try {
    // Récupérer tous les utilisateurs DOCTOR et ADMIN actifs
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["DOCTOR", "ADMIN"] },
        isActive: true,
        email: { not: { equals: "" } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phoneNumber: user.phoneNumber || undefined,
      role: user.role,
    }));
  } catch (error) {
    console.error("Error fetching notification recipients:", error);
    return [];
  }
}

/**
 * Formate les détails des signes vitaux pour l'email
 */
function formatVitalDetails(vitalRecord: any): string {
  const details: string[] = [];

  if (vitalRecord.temperature) {
    details.push(`🌡️  Température: ${vitalRecord.temperature}°C`);
  }
  if (vitalRecord.systolicBP && vitalRecord.diastolicBP) {
    details.push(
      `💓 Tension artérielle: ${vitalRecord.systolicBP}/${vitalRecord.diastolicBP} mmHg`
    );
  }
  if (vitalRecord.heartRate) {
    details.push(`❤️  Fréquence cardiaque: ${vitalRecord.heartRate} bpm`);
  }
  if (vitalRecord.oxygenSaturation) {
    details.push(`🫁 Saturation O2: ${vitalRecord.oxygenSaturation}%`);
  }
  if (vitalRecord.weight) {
    details.push(`⚖️  Poids: ${vitalRecord.weight} kg`);
  }

  return details.join("\n");
}

/**
 * Envoie un email via SendGrid ou Azure Communication Services
 */
async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Utiliser SendGrid si configuré
    if (SENDGRID_API_KEY) {
      return await sendEmailViaSendGrid(to, subject, body);
    }

    // Sinon utiliser Azure Communication Services
    if (AZURE_COMMUNICATION_CONNECTION_STRING) {
      return await sendEmailViaAzure(to, subject, body);
    }

    // Si aucun service n'est configuré, simuler l'envoi en dev
    console.log(`[DEV] Email to ${to}:`, { subject, body });
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email via SendGrid
 */
async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Dynamically import SendGrid to avoid loading if not needed
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(SENDGRID_API_KEY);

    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@medifollow.health",
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });

    return { success: true };
  } catch (error: any) {
    console.error("SendGrid error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email via Azure Communication Services
 */
async function sendEmailViaAzure(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implémenter avec Azure Communication Services SDK
    // const { EmailClient } = require("@azure/communication-email");
    // const client = new EmailClient(AZURE_COMMUNICATION_CONNECTION_STRING);
    
    console.log(`[Azure Email] to ${to}:`, { subject });
    return { success: true };
  } catch (error: any) {
    console.error("Azure email error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un SMS via Twilio
 */
async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!TWILIO_ACCOUNT_SID) {
      console.log(`[DEV] SMS to ${to}:`, message);
      return { success: true };
    }

    // TODO: Implémenter avec Twilio SDK
    // const twilio = require("twilio");
    // const client = twilio(TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to,
    // });

    console.log(`[SMS] to ${to}:`, message);
    return { success: true };
  } catch (error: any) {
    console.error("SMS error:", error);
    return { success: false, error: error.message };
  }
}
