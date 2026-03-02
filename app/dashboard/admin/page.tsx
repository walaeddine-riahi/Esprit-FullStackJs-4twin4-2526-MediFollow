"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCog,
  Activity,
  AlertCircle,
  Shield,
  Database,
  Clock,
  CheckCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAlertStats } from "@/lib/actions/alert.actions";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    openAlerts: 0,
  });

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

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      // Load alert stats
      const alertStatsResult = await getAlertStats();
      if (alertStatsResult.success && alertStatsResult.stats) {
        setStats((prev: any) => ({
          ...prev,
          ...alertStatsResult.stats,
        }));
      }

      // Note: Dans une vraie application, vous auriez des actions pour récupérer
      // les statistiques des utilisateurs depuis la base de données
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
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord Administrateur
          </h1>
          <p className="mt-1 text-gray-600">
            Gestion et supervision de la plateforme MediFollow
          </p>
        </div>

        {/* Main Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Utilisateurs</p>
                <p className="mt-2 text-3xl font-bold">{stats.totalUsers}</p>
                <p className="mt-1 text-xs text-blue-100">Total inscrits</p>
              </div>
              <Users size={40} className="opacity-80" />
            </div>
          </div>

          {/* Total Patients */}
          <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Patients</p>
                <p className="mt-2 text-3xl font-bold">{stats.totalPatients}</p>
                <p className="mt-1 text-xs text-green-100">Patients actifs</p>
              </div>
              <Activity size={40} className="opacity-80" />
            </div>
          </div>

          {/* Total Doctors */}
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Médecins</p>
                <p className="mt-2 text-3xl font-bold">{stats.totalDoctors}</p>
                <p className="mt-1 text-xs text-purple-100">Professionnels</p>
              </div>
              <UserCog size={40} className="opacity-80" />
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Alertes Critiques</p>
                <p className="mt-2 text-3xl font-bold">{stats.criticalAlerts}</p>
                <p className="mt-1 text-xs text-red-100">Nécessitent une action</p>
              </div>
              <AlertCircle size={40} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Total Alerts */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alertes</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.totalAlerts}
                </p>
              </div>
              <AlertCircle size={32} className="text-orange-500" />
            </div>
          </div>

          {/* Open Alerts */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertes Ouvertes</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.openAlerts}
                </p>
              </div>
              <Clock size={32} className="text-yellow-500" />
            </div>
          </div>

          {/* Resolved Alerts */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertes Résolues</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.resolvedAlerts || 0}
                </p>
              </div>
              <CheckCircle size={32} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/admin/users"
              className="rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:border-blue-500 hover:shadow-md"
            >
              <Users className="mx-auto mb-3 text-blue-600" size={36} />
              <h3 className="font-semibold text-gray-900">
                Gestion Utilisateurs
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Créer et gérer les comptes
              </p>
            </Link>

            <Link
              href="/dashboard/admin/alerts"
              className="rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:border-blue-500 hover:shadow-md"
            >
              <AlertCircle className="mx-auto mb-3 text-orange-600" size={36} />
              <h3 className="font-semibold text-gray-900">Supervision Alertes</h3>
              <p className="mt-1 text-sm text-gray-600">
                Surveiller toutes les alertes
              </p>
            </Link>

            <Link
              href="/dashboard/admin/audit"
              className="rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:border-blue-500 hover:shadow-md"
            >
              <Database className="mx-auto mb-3 text-purple-600" size={36} />
              <h3 className="font-semibold text-gray-900">Journal d&apos;Audit</h3>
              <p className="mt-1 text-sm text-gray-600">
                Historique des actions
              </p>
            </Link>

            <Link
              href="/dashboard/admin/blockchain"
              className="rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:border-blue-500 hover:shadow-md"
            >
              <Shield className="mx-auto mb-3 text-green-600" size={36} />
              <h3 className="font-semibold text-gray-900">Blockchain</h3>
              <p className="mt-1 text-sm text-gray-600">
                Preuves et vérifications
              </p>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            État du système
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">Base de données</p>
                <p className="text-sm text-gray-600">Opérationnelle</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">API</p>
                <p className="text-sm text-gray-600">Fonctionnelle</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <Clock className="text-yellow-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">Blockchain</p>
                <p className="text-sm text-gray-600">En attente config</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
