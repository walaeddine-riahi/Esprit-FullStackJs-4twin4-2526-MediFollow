"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  AlertCircle,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  DollarSign,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function NurseDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    assignedPatients: 12,
    openAlerts: 5,
    pendingReminders: 3,
    todayCheckIns: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="size-8 text-pink-600 dark:text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 rounded-xl p-6 border border-pink-200 dark:border-pink-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              👋 Bienvenue, {user?.firstName} !
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Espace infirmière - Gestion de vos patients et alertes
            </p>
          </div>
          <Heart className="size-12 text-pink-600 dark:text-pink-400 opacity-20" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Patients assignés
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.assignedPatients}
              </p>
            </div>
            <Users className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
          <Link
            href="/dashboard/nurse/patients"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Voir tous <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Alertes actives
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.openAlerts}
              </p>
            </div>
            <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <Link
            href="/dashboard/nurse/alerts"
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            Consulter <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Rappels en attente
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.pendingReminders}
              </p>
            </div>
            <Clock className="size-8 text-amber-600 dark:text-amber-400" />
          </div>
          <Link
            href="/dashboard/nurse/reminders"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Gérer <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Check-in aujourd'hui
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.todayCheckIns}
              </p>
            </div>
            <Activity className="size-8 text-pink-600 dark:text-pink-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ✓ À jour
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Reminder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Créer un rappel
            </h2>
            <Clock className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Envoyer un rappel personnalisé à vos patients
          </p>
          <Link
            href="/dashboard/nurse/reminders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Nouveau rappel
          </Link>
        </div>

        {/* Assign Patient */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Affecter un patient
            </h2>
            <Users className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Assigner un patient à un médecin
          </p>
          <Link
            href="/dashboard/nurse/patients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Assigner un patient
          </Link>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Alertes récentes
          </h2>
          <Link
            href="/dashboard/nurse/alerts"
            className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`mt-1 size-2 rounded-full ${
                    i === 1
                      ? "bg-red-600"
                      : i === 2
                        ? "bg-amber-600"
                        : "bg-orange-600"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Patient {i}: Alerte PA anormale
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {i === 1 ? "Critique" : i === 2 ? "Élevée" : "Moyenne"} | Il
                    y a {i * 2} minutes
                  </p>
                </div>
              </div>
              <button className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline whitespace-nowrap">
                Consulter
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
