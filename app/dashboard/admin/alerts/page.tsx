"use client";

import { useEffect, useState } from "react";
import { getAllAlerts } from "@/lib/actions/alert.actions";
import { AlertStatus } from "@/types/medifollow.types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Zap,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const result = await getAllAlerts(AlertStatus.OPEN);
      if (result.success && result.alerts) {
        setAlerts(result.alerts);
        setFiltered(result.alerts);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let result = alerts;

    if (search) {
      result = result.filter(
        (alert) =>
          alert.message?.toLowerCase().includes(search.toLowerCase()) ||
          alert.patientId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((alert) => alert.status === statusFilter);
    }

    if (severityFilter !== "all") {
      result = result.filter((alert) => alert.severity === severityFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, severityFilter, alerts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case AlertStatus.OPEN:
        return (
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
        );
      case AlertStatus.RESOLVED:
        return (
          <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
        );
      case AlertStatus.ACKNOWLEDGED:
        return <Clock className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />;
      default:
        return (
          <AlertCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          bg: "bg-red-50 dark:bg-red-500/10",
          border: "border-red-300 dark:border-red-500/50",
          text: "text-red-900 dark:text-red-300",
          badge: "bg-red-100 dark:bg-red-500/30 text-red-700 dark:text-red-300",
          icon: "text-red-600 dark:text-red-400",
        };
      case "HIGH":
        return {
          bg: "bg-orange-50 dark:bg-orange-500/10",
          border: "border-orange-300 dark:border-orange-500/50",
          text: "text-orange-900 dark:text-orange-300",
          badge:
            "bg-orange-100 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300",
          icon: "text-orange-600 dark:text-orange-400",
        };
      case "MEDIUM":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-500/10",
          border: "border-yellow-300 dark:border-yellow-500/50",
          text: "text-yellow-900 dark:text-yellow-300",
          badge:
            "bg-yellow-100 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300",
          icon: "text-yellow-600 dark:text-yellow-400",
        };
      case "LOW":
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-500/10",
          border: "border-blue-300 dark:border-blue-500/50",
          text: "text-blue-900 dark:text-blue-300",
          badge:
            "bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300",
          icon: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case AlertStatus.OPEN:
        return "bg-red-100 dark:bg-red-500/30 text-red-700 dark:text-red-300";
      case AlertStatus.RESOLVED:
        return "bg-green-100 dark:bg-green-500/30 text-green-700 dark:text-green-300";
      case AlertStatus.ACKNOWLEDGED:
        return "bg-cyan-100 dark:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-400/30 border-t-green-400"></div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const openCount = alerts.filter((a) => a.status === AlertStatus.OPEN).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Gestion des Alertes
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {filtered.length} alerte(s) affichée(s)
          {criticalCount > 0 && (
            <span className="ml-4 inline-block px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/30 text-red-700 dark:text-red-300 font-semibold text-sm">
              ⚠️ {criticalCount} critique(s)
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Ouvertes",
            count: openCount,
            icon: AlertCircle,
            color: "red",
          },
          {
            label: "Critiques",
            count: criticalCount,
            icon: Zap,
            color: "red",
          },
          {
            label: "Reconnues",
            count: alerts.filter((a) => a.status === AlertStatus.ACKNOWLEDGED)
              .length,
            icon: Clock,
            color: "cyan",
          },
          {
            label: "Résolues",
            count: alerts.filter((a) => a.status === AlertStatus.RESOLVED)
              .length,
            icon: CheckCircle2,
            color: "green",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            red: "dark:border-red-500/20 dark:from-red-500/5 dark:to-slate-900/50",
            cyan: "dark:border-cyan-400/20 dark:from-cyan-400/5 dark:to-slate-900/50",
            green:
              "dark:border-green-400/20 dark:from-green-400/5 dark:to-slate-900/50",
          };
          return (
            <div
              key={idx}
              className={`glass-panel rounded-xl border border-slate-200 dark:${colorMap[stat.color]} bg-gradient-to-br p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.count}
                  </p>
                </div>
                <Icon
                  className={`w-8 h-8 text-${stat.color}-500 dark:text-${stat.color}-400`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par message ou patient ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Statut
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tous" },
              { value: AlertStatus.OPEN, label: "🔴 Ouvertes" },
              { value: AlertStatus.ACKNOWLEDGED, label: "🟡 Reconnues" },
              { value: AlertStatus.RESOLVED, label: "🟢 Résolues" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  statusFilter === status.value
                    ? "bg-green-500 dark:bg-green-400 text-white dark:text-slate-900 shadow-lg"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sévérité
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tous" },
              { value: "CRITICAL", label: "🔴 Critique" },
              { value: "HIGH", label: "🟠 Haute" },
              { value: "MEDIUM", label: "🟡 Moyenne" },
              { value: "LOW", label: "🟢 Basse" },
            ].map((severity) => (
              <button
                key={severity.value}
                onClick={() => setSeverityFilter(severity.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  severityFilter === severity.value
                    ? "bg-green-500 dark:bg-green-400 text-white dark:text-slate-900 shadow-lg"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                {severity.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Aucune alerte trouvée
            </p>
          </div>
        ) : (
          filtered.map((alert) => {
            const severityColor = getSeverityColor(alert.severity);
            const statusBadge = getStatusBadge(alert.status);
            return (
              <Link key={alert.id} href={`/dashboard/admin/alerts/${alert.id}`}>
                <div
                  className={`glass-panel rounded-xl border-2 p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${severityColor.bg} ${severityColor.border}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-lg mt-1 ${severityColor.badge}`}
                      >
                        {getStatusIcon(alert.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`font-semibold text-lg ${severityColor.text} truncate`}
                          >
                            {alert.message}
                          </h3>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge}`}
                          >
                            {alert.status === AlertStatus.OPEN && "Ouverte"}
                            {alert.status === AlertStatus.ACKNOWLEDGED &&
                              "Reconnue"}
                            {alert.status === AlertStatus.RESOLVED && "Résolue"}
                          </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${severityColor.badge}`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p
                          className={`text-sm opacity-75 ${severityColor.text}`}
                        >
                          Patient:{" "}
                          <span className="font-mono">{alert.patientId}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 flex-shrink-0 ${severityColor.text}`}
                    />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
