"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  User,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllAlerts } from "@/lib/actions/alert.actions";
import { AlertSeverity, AlertStatus } from "@/types/medifollow.types";

// Interface adaptée pour correspondre à ce que Prisma retourne
interface Alert {
  id: string;
  alertType: string;
  severity: string; // Utiliser string au lieu de AlertSeverity enum
  status: string; // Utiliser string au lieu de AlertStatus enum
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

export default function AdminAlertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get filters from URL
  const statusFilter = searchParams.get("status") || "ALL";
  const severityFilter = searchParams.get("severity") || "ALL";

  useEffect(() => {
    checkAuthAndLoadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchQuery, statusFilter, severityFilter]);

  async function checkAuthAndLoadAlerts() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      await loadAlerts();
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    }
  }

  async function loadAlerts() {
    try {
      setLoading(true);
      const result = await getAllAlerts();
      if (result.success && result.alerts) {
        // Mapper les données de Prisma vers notre interface
        const mappedAlerts: Alert[] = result.alerts.map((alert: any) => ({
          id: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          status: alert.status,
          message: alert.message,
          createdAt: alert.createdAt,
          acknowledgedAt: alert.acknowledgedAt,
          resolvedAt: alert.resolvedAt,
          patientId: alert.patientId,
          patient: alert.patient ? {
            user: {
              id: alert.patient.user.id,
              email: alert.patient.user.email,
              firstName: alert.patient.user.firstName,
              lastName: alert.patient.user.lastName,
              phoneNumber: alert.patient.user.phoneNumber,
            }
          } : undefined,
          acknowledgedBy: alert.acknowledgedBy ? {
            firstName: alert.acknowledgedBy.firstName,
            lastName: alert.acknowledgedBy.lastName,
          } : null,
          resolvedBy: alert.resolvedBy ? {
            firstName: alert.resolvedBy.firstName,
            lastName: alert.resolvedBy.lastName,
          } : null,
        }));
        
        setAlerts(mappedAlerts);
        setFilteredAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterAlerts() {
    let filtered = [...alerts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.message?.toLowerCase().includes(query) ||
          alert.alertType?.toLowerCase().includes(query) ||
          alert.patient?.user?.email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter from URL
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    // Apply severity filter from URL
    if (severityFilter !== "ALL") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    setFilteredAlerts(filtered);
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle size={14} className="text-red-600" />;
      case "HIGH":
        return <AlertTriangle size={14} className="text-orange-600" />;
      case "MEDIUM":
        return <AlertCircle size={14} className="text-yellow-600" />;
      case "LOW":
        return <Info size={14} className="text-blue-600" />;
      default:
        return <AlertCircle size={14} />;
    }
  }

  function getSeverityLabel(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return "Critique";
      case "HIGH":
        return "Haute";
      case "MEDIUM":
        return "Moyenne";
      case "LOW":
        return "Basse";
      default:
        return severity;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "OPEN":
        return "bg-orange-100 text-orange-700";
      case "ACKNOWLEDGED":
        return "bg-blue-100 text-blue-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "OPEN":
        return <AlertCircle size={14} className="text-orange-600" />;
      case "ACKNOWLEDGED":
        return <Clock size={14} className="text-blue-600" />;
      case "RESOLVED":
        return <CheckCircle size={14} className="text-green-600" />;
      default:
        return null;
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "OPEN":
        return "Ouverte";
      case "ACKNOWLEDGED":
        return "Reconnue";
      case "RESOLVED":
        return "Résolue";
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">
            Chargement des alertes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Supervision des Alertes
              </h1>
              <p className="text-sm text-gray-600">
                {filteredAlerts.length} alerte{filteredAlerts.length !== 1 ? 's' : ''} trouvée{filteredAlerts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par message, type ou email..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filtres actifs:</span>
            </div>

            {statusFilter !== "ALL" && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(statusFilter)}`}>
                {getStatusIcon(statusFilter)}
                Statut: {getStatusLabel(statusFilter)}
              </span>
            )}
            
            {severityFilter !== "ALL" && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(severityFilter)}`}>
                {getSeverityIcon(severityFilter)}
                Sévérité: {getSeverityLabel(severityFilter)}
              </span>
            )}

            {(statusFilter !== "ALL" || severityFilter !== "ALL") && (
              <Link
                href="/dashboard/admin/alerts"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Réinitialiser
              </Link>
            )}
          </div>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Aucune alerte trouvée
            </h3>
            <p className="text-sm text-gray-600">
              {statusFilter !== "ALL" || severityFilter !== "ALL"
                ? "Aucune alerte ne correspond aux filtres sélectionnés"
                : "Aucune alerte n'a été créée pour le moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={`/dashboard/admin/alerts/${alert.id}`}
                className="block group"
              >
                <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            alert.severity
                          )}`}
                        >
                          {getSeverityIcon(alert.severity)}
                          {getSeverityLabel(alert.severity)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            alert.status
                          )}`}
                        >
                          {getStatusIcon(alert.status)}
                          {getStatusLabel(alert.status)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {alert.message || alert.alertType}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {alert.patient?.user && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {alert.patient.user.firstName} {alert.patient.user.lastName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {alert.resolvedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} />
                            Résolue le{" "}
                            {new Date(alert.resolvedAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors ml-4"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ouvertes</p>
                <p className="text-xl font-bold text-orange-600">
                  {alerts.filter((a) => a.status === "OPEN").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reconnues</p>
                <p className="text-xl font-bold text-blue-600">
                  {alerts.filter((a) => a.status === "ACKNOWLEDGED").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Résolues</p>
                <p className="text-xl font-bold text-green-600">
                  {alerts.filter((a) => a.status === "RESOLVED").length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Critiques: {alerts.filter((a) => a.severity === "CRITICAL").length}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                Hautes: {alerts.filter((a) => a.severity === "HIGH").length}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                Moyennes: {alerts.filter((a) => a.severity === "MEDIUM").length}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Basses: {alerts.filter((a) => a.severity === "LOW").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}