"use client";

<<<<<<< HEAD
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
=======
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getNursePatientAlerts, acknowledgeAlertAsNurse } from "@/lib/actions/nurse.actions";

export default function NurseAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
>>>>>>> ai-features-backup

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
<<<<<<< HEAD
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
=======
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "NURSE") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const result = await getNursePatientAlerts(currentUser.id);
      if (result.success && result.data) {
        setAlerts(result.data);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
>>>>>>> ai-features-backup
    } finally {
      setLoading(false);
    }
  }

<<<<<<< HEAD
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
=======
  async function handleAcknowledge(alertId: string) {
    if (!user) return;

    try {
      const result = await acknowledgeAlertAsNurse(alertId, user.id);
      if (result.success) {
        // Refresh alerts
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  }

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((alert) => {
        const patientName = alert.patient?.user
          ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`.toLowerCase()
          : "";
        const message = alert.message?.toLowerCase() || "";
        return patientName.includes(query) || message.includes(query);
      });
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    return filtered;
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="text-red-600" size={20} />;
      case "HIGH":
        return <AlertTriangle className="text-orange-600" size={20} />;
      case "MEDIUM":
        return <AlertTriangle className="text-yellow-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400";
      case "ACKNOWLEDGED":
        return "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "RESOLVED":
        return "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chargement...
          </p>
        </div>
>>>>>>> ai-features-backup
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="p-6 bg-gray-50 dark:bg-black min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Surveillance des alertes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Alertes pour vos patients assignés
        </p>
      </div>

      <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critiques</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.severity === "CRITICAL").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Élevées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.severity === "HIGH").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ouvertes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.status === "OPEN").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acquittées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.status === "ACKNOWLEDGED").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none appearance-none"
              >
                <option value="all">Toutes les sévérités</option>
                <option value="CRITICAL">Critique</option>
                <option value="HIGH">Élevée</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="LOW">Faible</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-4 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="OPEN">Ouvertes</option>
              <option value="ACKNOWLEDGED">Acquittées</option>
              <option value="RESOLVED">Résolues</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                  ? "Aucune alerte correspondante"
                  : "Aucune alerte active"}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/dashboard/nurse/patients/${alert.patient?.id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
                        >
                          {alert.patient?.user?.firstName}{" "}
                          {alert.patient?.user?.lastName}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeClass(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(alert.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span>Type: {alert.alertType}</span>
>>>>>>> ai-features-backup
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
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
=======
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {alert.status === "OPEN" && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Acquitter
                      </button>
                    )}
                    <Link
                      href={`/dashboard/nurse/patients/${alert.patient?.id}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                    >
                      Voir patient
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Note importante</p>
              <p>
                En tant qu'infirmier(ère), vous pouvez voir et acquitter les alertes, mais seul un médecin peut les résoudre.
                Si une alerte nécessite une attention médicale urgente, contactez immédiatement le médecin traitant.
              </p>
            </div>
          </div>
        </div>
>>>>>>> ai-features-backup
      </div>
    </div>
  );
}
