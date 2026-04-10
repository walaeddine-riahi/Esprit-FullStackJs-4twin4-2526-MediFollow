"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Activity,
  Filter,
  ChevronRight,
} from "lucide-react";
import {
  getNurseAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "@/lib/actions/nurse.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function NurseAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentNurseId, setCurrentNurseId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      setError("");

      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error("User not authenticated, redirecting to login");
        setError("Session expirée. Veuillez vous reconnecter pour continuer.");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      setCurrentNurseId(currentUser.id);

      // Fetch alerts
      const result = await getNurseAlerts(currentUser.id);
      if (result.success && result.alerts) {
        setAlerts(result.alerts);
      } else {
        setError(result.error || "Erreur lors du chargement des alertes");
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
      setError("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const patientName = `${alert.patient?.user?.firstName} ${alert.patient?.user?.lastName}`;
    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || alert.status === filterStatus;

    const matchesSeverity =
      filterSeverity === "all" || alert.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleAcknowledge = async (alertId: string) => {
    if (!currentNurseId) return;
    try {
      setActionInProgress(alertId);
      const result = await acknowledgeAlert(alertId, currentNurseId);
      if (result.success) {
        setAlerts(
          alerts.map((a) =>
            a.id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a
          )
        );
        setSuccessMessage("Alerte acceptée");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Erreur lors de l'acceptation");
      }
    } catch (err) {
      console.error("Error acknowledging alert:", err);
      setError("Erreur lors de l'acceptation");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    if (!currentNurseId) return;
    try {
      setActionInProgress(alertId);
      const result = await resolveAlert(alertId, currentNurseId);
      if (result.success) {
        setAlerts(
          alerts.map((a) =>
            a.id === alertId ? { ...a, status: "RESOLVED" } : a
          )
        );
        setSuccessMessage("Alerte résolue");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Erreur lors de la résolution");
      }
    } catch (err) {
      console.error("Error resolving alert:", err);
      setError("Erreur lors de la résolution");
    } finally {
      setActionInProgress(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          bg: "bg-red-100 dark:bg-red-500/10",
          text: "text-red-700 dark:text-red-400",
          badge: "bg-red-200 dark:bg-red-500/20",
          icon: "text-red-600 dark:text-red-500",
        };
      case "HIGH":
        return {
          bg: "bg-orange-100 dark:bg-orange-500/10",
          text: "text-orange-700 dark:text-orange-400",
          badge: "bg-orange-200 dark:bg-orange-500/20",
          icon: "text-orange-600 dark:text-orange-500",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-100 dark:bg-amber-500/10",
          text: "text-amber-700 dark:text-amber-400",
          badge: "bg-amber-200 dark:bg-amber-500/20",
          icon: "text-amber-600 dark:text-amber-500",
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-500/10",
          text: "text-blue-700 dark:text-blue-400",
          badge: "bg-blue-200 dark:bg-blue-500/20",
          icon: "text-blue-600 dark:text-blue-500",
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-red-600 dark:text-red-400";
      case "ACKNOWLEDGED":
        return "text-amber-600 dark:text-amber-400";
      case "RESOLVED":
        return "text-pink-600 dark:text-pink-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const openCount = alerts.filter((a) => a.status === "OPEN").length;
  const ackCount = alerts.filter((a) => a.status === "ACKNOWLEDGED").length;
  const resolvedCount = alerts.filter((a) => a.status === "RESOLVED").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="size-8 text-pink-600 dark:text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4">
          <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/30 p-4">
          <Activity className="size-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
          <p className="text-pink-700 dark:text-pink-400 text-sm">
            {successMessage}
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Alertes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Consultez et validez les alertes des patients
        </p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20 p-4">
          <p className="text-xs text-red-700 dark:text-red-400 font-semibold uppercase">
            Alertes actives
          </p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {openCount}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20 p-4">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase">
            En cours de traitement
          </p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {ackCount}
          </p>
        </div>
        <div className="bg-pink-50 dark:bg-pink-500/10 rounded-lg border border-pink-200 dark:border-pink-500/20 p-4">
          <p className="text-xs text-pink-700 dark:text-pink-400 font-semibold uppercase">
            Résolues
          </p>
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-2">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Chercher par patient ou message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
          title="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="OPEN">Actives</option>
          <option value="ACKNOWLEDGED">En cours</option>
          <option value="RESOLVED">Résolues</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
          title="Filtrer par sévérité"
        >
          <option value="all">Toutes les sévérités</option>
          <option value="CRITICAL">Critique</option>
          <option value="HIGH">Élevée</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="LOW">Basse</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const colors = getSeverityColor(alert.severity);
            const statusColor = getStatusColor(alert.status);
            const patientName = `${alert.patient?.user?.firstName} ${alert.patient?.user?.lastName}`;

            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 transition-all ${colors.bg} border-opacity-50`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 p-2 rounded-lg ${colors.badge}`}>
                      {alert.severity === "CRITICAL" && (
                        <Zap className={`size-5 ${colors.icon}`} />
                      )}
                      {alert.severity === "HIGH" && (
                        <AlertTriangle className={`size-5 ${colors.icon}`} />
                      )}
                      {alert.severity === "MEDIUM" && (
                        <AlertCircle className={`size-5 ${colors.icon}`} />
                      )}
                      {alert.severity === "LOW" && (
                        <Activity className={`size-5 ${colors.icon}`} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-sm ${colors.text}`}>
                          {patientName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            alert.status === "OPEN"
                              ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                              : alert.status === "ACKNOWLEDGED"
                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400"
                          }`}
                        >
                          {alert.status === "OPEN"
                            ? "🔴 Active"
                            : alert.status === "ACKNOWLEDGED"
                              ? "🟡 En cours"
                              : "✓ Résolue"}
                        </span>
                      </div>

                      <p className={`text-sm font-medium ${colors.text} mb-2`}>
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {Math.floor(
                            (Date.now() - new Date(alert.createdAt).getTime()) /
                              60000
                          )}{" "}
                          min
                        </div>
                        <div>
                          Type:{" "}
                          <span className="font-semibold">
                            {alert.type || "VITAL"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {alert.status === "OPEN" && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={actionInProgress === alert.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionInProgress === alert.id ? "..." : "Accepter"}
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={actionInProgress === alert.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionInProgress === alert.id ? "..." : "Résoudre"}
                        </button>
                      </>
                    )}
                    {alert.status === "ACKNOWLEDGED" && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={actionInProgress === alert.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionInProgress === alert.id ? "..." : "Résoudre"}
                      </button>
                    )}
                    {alert.status === "RESOLVED" && (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-pink-700 dark:text-pink-400">
                        ✓ Terminée
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CheckCircle2 className="size-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune alerte trouvée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
