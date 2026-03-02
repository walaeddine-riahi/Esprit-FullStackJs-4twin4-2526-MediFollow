"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPatientAlerts } from "@/lib/actions/alert.actions";
import { formatDateTime } from "@/lib/utils";

export default function PatientAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "acknowledged">("all");

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  async function loadAlerts() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (!user.patient?.id) {
        return;
      }

      const result = await getPatientAlerts(user.patient.id);

      if (result.success && result.alerts) {
        setAlerts(result.alerts);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle size={20} className="text-red-600" />;
      case "ACKNOWLEDGED":
        return <Clock size={20} className="text-yellow-600" />;
      case "RESOLVED":
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard/patient"
            className="rounded-lg p-2 hover:bg-gray-200"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Mes alertes</h1>
            <p className="text-gray-600">
              Consultez l&apos;historique de vos alertes médicales
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filter === "open"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Actives
          </button>
          <button
            onClick={() => setFilter("acknowledged")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filter === "acknowledged"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Acquittées
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow-sm">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900">
                Aucune alerte
              </h3>
              <p className="mt-2 text-gray-600">
                Tout va bien ! Vous n&apos;avez pas d&apos;alerte pour le moment.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border bg-white p-6 shadow-sm ${
                  alert.status === "OPEN" ? "border-red-300" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {alert.alertType === "VITAL"
                              ? "Alerte Signes Vitaux"
                              : alert.alertType === "SYMPTOM"
                                ? "Alerte Symptôme"
                                : "Alerte Système"}
                          </h3>
                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">{alert.message}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        Créée: {formatDateTime(alert.createdAt)}
                      </span>
                      {alert.acknowledgedAt && (
                        <span>
                          Acquittée:{" "}
                          {formatDateTime(alert.acknowledgedAt)}
                        </span>
                      )}
                      {alert.resolvedAt && (
                        <span>
                          Résolue: {formatDateTime(alert.resolvedAt)}
                        </span>
                      )}
                    </div>

                    {alert.resolution && (
                      <div className="mt-4 rounded-lg bg-green-50 p-3">
                        <p className="text-sm font-medium text-green-900">
                          Résolution:
                        </p>
                        <p className="mt-1 text-sm text-green-800">
                          {alert.resolution}
                        </p>
                      </div>
                    )}

                    {alert.data && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm font-medium text-gray-900">
                          Détails:
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-gray-700">
                          {alert.data.vitalType && (
                            <p>Type: {alert.data.vitalType}</p>
                          )}
                          {alert.data.value !== undefined && (
                            <p>Valeur mesurée: {alert.data.value}</p>
                          )}
                          {alert.data.threshold && (
                            <p>
                              Seuil: {alert.data.threshold.min} -{" "}
                              {alert.data.threshold.max}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        alert.status === "OPEN"
                          ? "bg-red-100 text-red-800"
                          : alert.status === "ACKNOWLEDGED"
                            ? "bg-yellow-100 text-yellow-800"
                            : alert.status === "RESOLVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
