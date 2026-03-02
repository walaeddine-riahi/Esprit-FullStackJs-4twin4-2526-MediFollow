"use client";

import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  TrendingUp,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getPatientAlerts } from "@/lib/actions/alert.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getVitalRecords, getVitalStats } from "@/lib/actions/vital.actions";
import { formatDateTime } from "@/lib/utils";

export default function PatientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentVitals, setRecentVitals] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      setPatient(user.patient);

      if (user.patient?.id) {
        const patientId = user.patient.id;

        // Load recent vitals
        const vitalsResult = await getVitalRecords(patientId, 10);
        if (vitalsResult.success && vitalsResult.records) {
          setRecentVitals(vitalsResult.records);
          if (vitalsResult.records.length > 0) {
            setLatestVitals(vitalsResult.records[0]);
          }
        }

        // Load stats
        const statsResult = await getVitalStats(patientId, 7);
        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats);
        }

        // Load alerts
        const alertsResult = await getPatientAlerts(patientId);
        if (alertsResult.success && alertsResult.alerts) {
          setAlerts(alertsResult.alerts);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const getVitalStatus = (
    value: number | null | undefined,
    min: number,
    max: number
  ) => {
    if (!value) return "gray";
    if (value < min || value > max) return "red";
    if (value < min * 1.1 || value > max * 0.9) return "yellow";
    return "green";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord Patient
            </h1>
            <p className="mt-1 text-gray-600">
              Bienvenue, {patient?.user?.firstName || "Patient"}
            </p>
          </div>
          <Link
            href="/dashboard/patient/vitals"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Enregistrer des signes vitaux
          </Link>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <h2 className="font-semibold">
                Alertes actives ({alerts.length})
              </h2>
            </div>
            <div className="mt-3 space-y-2">
              {alerts.slice(0, 3).map((alert: any) => (
                <div
                  key={alert.id}
                  className="rounded-md bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {alerts.length > 3 && (
              <Link
                href="/dashboard/patient/alerts"
                className="mt-3 inline-block text-sm text-red-700 hover:text-red-900"
              >
                Voir toutes les alertes →
              </Link>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Systolic BP */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tension systolique</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {latestVitals?.systolicBP || "--"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Moy. 7j: {stats?.avgSystolicBP?.toFixed(1) || "--"} mmHg
                </p>
              </div>
              <Heart
                size={40}
                className={`${
                  latestVitals?.systolicBP
                    ? getVitalStatus(latestVitals.systolicBP, 90, 140) === "red"
                      ? "text-red-500"
                      : getVitalStatus(latestVitals.systolicBP, 90, 140) ===
                          "yellow"
                        ? "text-yellow-500"
                        : "text-green-500"
                    : "text-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Heart Rate */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fréquence cardiaque</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {latestVitals?.heartRate || "--"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Moy. 7j: {stats?.avgHeartRate?.toFixed(0) || "--"} bpm
                </p>
              </div>
              <Activity
                size={40}
                className={`${
                  latestVitals?.heartRate
                    ? getVitalStatus(latestVitals.heartRate, 60, 100) === "red"
                      ? "text-red-500"
                      : getVitalStatus(latestVitals.heartRate, 60, 100) ===
                          "yellow"
                        ? "text-yellow-500"
                        : "text-green-500"
                    : "text-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Température</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {latestVitals?.temperature || "--"}°C
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Moy. 7j: {stats?.avgTemperature?.toFixed(1) || "--"}°C
                </p>
              </div>
              <Thermometer
                size={40}
                className={`${
                  latestVitals?.temperature
                    ? getVitalStatus(latestVitals.temperature, 36, 37.5) ===
                      "red"
                      ? "text-red-500"
                      : getVitalStatus(latestVitals.temperature, 36, 37.5) ===
                          "yellow"
                        ? "text-yellow-500"
                        : "text-green-500"
                    : "text-gray-400"
                }`}
              />
            </div>
          </div>

          {/* SpO2 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SpO2</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {latestVitals?.oxygenSaturation || "--"}%
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Moy. 7j: {stats?.avgOxygenSaturation?.toFixed(1) || "--"}%
                </p>
              </div>
              <Wind
                size={40}
                className={`${
                  latestVitals?.oxygenSaturation
                    ? getVitalStatus(latestVitals.oxygenSaturation, 95, 100) ===
                      "red"
                      ? "text-red-500"
                      : getVitalStatus(
                            latestVitals.oxygenSaturation,
                            95,
                            100
                          ) === "yellow"
                        ? "text-yellow-500"
                        : "text-green-500"
                    : "text-gray-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Recent Vitals Table */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Derniers enregistrements
            </h2>
            <Link
              href="/dashboard/patient/vitals/history"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir l&apos;historique →
            </Link>
          </div>

          {recentVitals.length === 0 ? (
            <div className="py-12 text-center">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                Aucun enregistrement pour le moment
              </p>
              <Link
                href="/dashboard/patient/vitals"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
              >
                Enregistrer vos premiers signes vitaux
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Tension
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      FC
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Temp
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      SpO2
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentVitals.map((vital: any) => {
                    const hasAbnormal =
                      vital.systolicBP > 140 ||
                      vital.systolicBP < 90 ||
                      vital.heartRate > 100 ||
                      vital.heartRate < 60 ||
                      vital.temperature > 37.5 ||
                      vital.temperature < 36 ||
                      vital.oxygenSaturation < 95;

                    return (
                      <tr key={vital.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTime(vital.recordedAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {vital.systolicBP || "--"}/{vital.diastolicBP || "--"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {vital.heartRate || "--"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {vital.temperature || "--"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {vital.oxygenSaturation || "--"}
                        </td>
                        <td className="px-4 py-3">
                          {hasAbnormal ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle size={16} />
                              Anormal
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={16} />
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/patient/vitals"
            className="rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-500 hover:shadow-md"
          >
            <Plus className="mx-auto mb-2 text-blue-600" size={32} />
            <h3 className="font-semibold text-gray-900">
              Nouveaux signes vitaux
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Enregistrer vos mesures du jour
            </p>
          </Link>

          <Link
            href="/dashboard/patient/alerts"
            className="rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-500 hover:shadow-md"
          >
            <AlertCircle className="mx-auto mb-2 text-orange-600" size={32} />
            <h3 className="font-semibold text-gray-900">Mes alertes</h3>
            <p className="mt-1 text-sm text-gray-600">
              {alerts.length} alerte{alerts.length !== 1 ? "s" : ""} active
              {alerts.length !== 1 ? "s" : ""}
            </p>
          </Link>

          <Link
            href="/dashboard/patient/vitals/history"
            className="rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-500 hover:shadow-md"
          >
            <TrendingUp className="mx-auto mb-2 text-green-600" size={32} />
            <h3 className="font-semibold text-gray-900">
              Historique et graphiques
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Visualiser votre progression
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
