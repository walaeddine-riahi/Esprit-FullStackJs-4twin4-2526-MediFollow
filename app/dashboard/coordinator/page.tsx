"use client";

import {
<<<<<<< HEAD
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardList,
  Users,
  ChevronRight,
  TrendingUp,
=======
  Users,
  CheckCircle,
  XCircle,
  FileQuestion,
  MessageSquare,
  Search,
  AlertCircle,
  TrendingUp,
  Send,
>>>>>>> ai-features-backup
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
<<<<<<< HEAD
import { getCoordinatorDashboardOverview } from "@/lib/actions/coordinator.actions";

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      const res = await getCoordinatorDashboardOverview();
      if (res.success && res.data) {
        setData(res.data);
        setLoadError(null);
      } else {
        setLoadError(res.error ?? "Impossible de charger le tableau de bord.");
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement…</p>
=======
import {
  getCoordinatorDashboardStats,
  getPatientComplianceStatus,
  getNonCompliantPatients,
} from "@/lib/actions/coordinator.actions";
import { StatCard } from "@/components/StatCard";

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [nonCompliantPatients, setNonCompliantPatients] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Load dashboard stats
      const statsResult = await getCoordinatorDashboardStats();
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Load non-compliant patients
      const nonCompliantResult = await getNonCompliantPatients();
      if (nonCompliantResult.success && nonCompliantResult.data) {
        setNonCompliantPatients(nonCompliantResult.data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chargement...
          </p>
>>>>>>> ai-features-backup
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  if (!data) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        {loadError ?? "Impossible de charger le tableau de bord."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/80 to-white dark:from-blue-950/30 dark:to-black">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Espace coordinateur
          </p>
          <h1 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
            Conformité du suivi post-hospitalisation
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Supervisez les protocoles, les entrées quotidiennes, les
            questionnaires et les alertes pour tous les patients.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Users className="size-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {data.assignedCount}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Patients suivis
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className="size-8 text-amber-600" />
              <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
                {data.missingVitalToday}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-amber-800/80 dark:text-amber-200/80">
              Sans constantes aujourd&apos;hui
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Activity className="size-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {data.openAlerts}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Alertes ouvertes
            </p>
            <p className="text-xs text-gray-400">
              {data.acknowledgedAlerts} en cours (acquittées)
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <TrendingUp className="size-8 text-emerald-600" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {data.avgCompliance}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Conformité moyenne (7 j.)
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Patients et conformité
              </h2>
              <Link
                href="/dashboard/coordinator/patients"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Tout voir
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.patients.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-500">
                  Aucun patient disponible.
                </p>
              ) : (
                data.patients.slice(0, 8).map((p: any) => (
                  <Link
                    key={p.patientId}
                    href={`/dashboard/coordinator/patients/${p.patientId}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {p.user?.firstName} {p.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.medicalRecordNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {p.missingVitalToday ? (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                          Entrée manquante
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          A jour
                        </span>
                      )}
                      <span className="text-sm font-black text-gray-900 dark:text-white w-12 text-right">
                        {p.overallScore}%
                      </span>
                    </div>
=======
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord coordinateur
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Link
              href="/dashboard/coordinator/communications"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
              Envoyer un message
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            type="appointments"
            count={stats?.totalPatientsMonitored || 0}
            label="Patients surveillés"
            icon="/assets/icons/appointments.svg"
          />
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conformes aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.compliantToday || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <XCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Non-conformes aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.nonCompliantToday || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
                <FileQuestion className="text-yellow-600 dark:text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Questionnaires en attente
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.pendingQuestionnaires || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/coordinator/compliance"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Suivi de conformité
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voir l'état de conformité
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/coordinator/communications"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Communications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Envoyer rappels et conseils
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/coordinator/verify"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                <Search className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Vérifier les entrées
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contrôler l'exhaustivité
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Non-Compliant Patients */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Patients non-conformes
              </h2>
              <Link
                href="/dashboard/coordinator/compliance"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {nonCompliantPatients.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-3" size={48} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tous les patients sont conformes aujourd'hui
                  </p>
                </div>
              ) : (
                nonCompliantPatients.slice(0, 5).map((item: any) => (
                  <Link
                    key={item.patient.id}
                    href={`/dashboard/coordinator/compliance/${item.patient.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.patient.user.firstName} {item.patient.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Statut: {item.complianceStatus}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                      Action requise
                    </span>
>>>>>>> ai-features-backup
                  </Link>
                ))
              )}
            </div>
          </div>

<<<<<<< HEAD
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="size-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Actions rapides
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/dashboard/coordinator/ai-assistant"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <Brain className="size-4" />
                    Assistant IA d'analyse
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/patients"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Vérifier les patients en retard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/alerts"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Suivre les alertes médecins
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/reminders"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Historique des rappels
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/guide"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Aider les patients à remplir leurs données
                  </Link>
                </li>
              </ul>
            </div>
            {data.unresolvedFlags > 0 && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 p-5">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                  {data.unresolvedFlags} signalement(s) ouvert(s)
                </p>
                <Link
                  href="/dashboard/coordinator/reviews"
                  className="mt-2 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Traiter les revues →
                </Link>
              </div>
            )}
=======
          {/* Recent Communications */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Communications récentes
              </h2>
              <Link
                href="/dashboard/coordinator/communications"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {!stats?.recentCommunications || stats.recentCommunications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucune communication récente
                </p>
              ) : (
                stats.recentCommunications.slice(0, 5).map((comm: any) => (
                  <div
                    key={comm.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <MessageSquare
                      className={
                        comm.type === "REMINDER"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }
                      size={20}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {comm.type === "REMINDER" ? "Rappel" : comm.type === "GUIDANCE" ? "Conseil" : "Suivi"}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${comm.isRead ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                          {comm.isRead ? "Lu" : "Non lu"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {comm.message.substring(0, 60)}
                        {comm.message.length > 60 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(comm.sentAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
>>>>>>> ai-features-backup
          </div>
        </div>
      </div>
    </div>
  );
}
