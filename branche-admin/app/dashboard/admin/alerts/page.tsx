import { Metadata } from "next";
import AlertsDashboard from "@/components/admin/AlertsDashboard";

export const metadata: Metadata = {
  title: "Gestion d'Alertes | MediFollow",
  description: "Dashboard de supervision des alertes patients en temps réel",
};

interface Alert {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  patientId: string;
  patient?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string | null;
    };
  };
  acknowledgedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  resolvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
}

async function getAlerts(): Promise<Alert[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/alerts`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.alerts)) {
      return data.alerts.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
        acknowledgedAt: alert.acknowledgedAt
          ? new Date(alert.acknowledgedAt)
          : null,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
}

export default async function AdminAlertsPage() {
  const alerts = await getAlerts();

  return <AlertsDashboard initialAlerts={alerts} />;
}
