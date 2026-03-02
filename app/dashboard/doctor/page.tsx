"use client";

import {
  Users,
  AlertCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAllAlerts, getAlertStats } from "@/lib/actions/alert.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { formatDateTime } from "@/lib/utils";
import { AlertStatus } from "@/types/medifollow.types";

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      // Load alert stats
      const statsResult = await getAlertStats();
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Load recent alerts
      const alertsResult = await getAllAlerts(AlertStatus.OPEN);
      if (alertsResult.success && alertsResult.alerts) {
        setRecentAlerts(alertsResult.alerts.slice(0, 10));
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d&apos;ensemble de vos patients et alertes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alertes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.totalAlerts || 0}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <AlertCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Open Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Alertes Ouvertes
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {stats?.openAlerts || 0}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critiques</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {stats?.criticalAlerts || 0}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <Activity size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Resolved Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Résolues</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats?.resolvedAlerts || 0}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Alertes récentes
          </h2>
          <Link
            href="/dashboard/doctor/alerts"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Voir toutes →
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <p className="text-gray-600">Aucune alerte ouverte</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 transition hover:shadow-md ${
                  alert.severity === "CRITICAL"
                    ? "border-red-200 bg-red-50"
                    : alert.severity === "HIGH"
                      ? "border-orange-200 bg-orange-50"
                      : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : alert.severity === "HIGH"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {alert.patient?.user
                          ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`
                          : "Patient inconnu"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-900">
                      {alert.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateTime(alert.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/doctor/alerts/${alert.id}`}
                    className="ml-4 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Traiter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
