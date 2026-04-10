"use client";

/* eslint-disable @next/next/no-style-component-with-dynamic-styles */

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth.actions";
import {
  Heart,
  Wind,
  Zap,
  Droplet,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  LogOut,
  Settings,
  Bell,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface AlertRecord {
  id: string;
  alertType: string;
  severity: string;
  status: string;
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

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  percentage?: number;
}

// ============================================================================
// DESIGN TOKENS (CSS Custom Properties)
// ============================================================================

const designTokens = {
  colors: {
    // Base
    bgPrimary: "#0F1117",
    bgSecondary: "#1A1D27",
    borderColor: "rgba(255,255,255,0.08)",
    textPrimary: "#F0F2F5",
    textSecondary: "#8892A4",
    accent: "#3B82F6",

    // Severity
    critical: "#E24B4A",
    high: "#EF9F27",
    medium: "#378ADD",
    low: "#639922",

    // Status
    open: "#DC2626",
    acknowledged: "#3B82F6",
    resolved: "#10B981",
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "1.5rem",
  },
};

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

function MetricCard({
  label,
  value,
  icon,
  color,
  trend,
  percentage,
}: MetricCardProps) {
  const colorMap: Record<string, string> = {
    critical: designTokens.colors.critical,
    high: designTokens.colors.high,
    medium: designTokens.colors.medium,
    low: designTokens.colors.low,
    resolved: designTokens.colors.resolved,
  };

  const bgColor = colorMap[color] || color;

  return (
    <div
      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor: designTokens.colors.bgSecondary,
        border: `1px solid ${designTokens.colors.borderColor}`,
      }}
    >
      {/* Gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5"
        style={{ backgroundColor: bgColor }}
      />

      <div className="relative p-6">
        {/* Icon */}
        <div
          className="mb-4 inline-flex items-center justify-center rounded-lg p-3 transition-all duration-300"
          style={{
            backgroundColor: `${bgColor}20`,
            color: bgColor,
          }}
        >
          {icon}
        </div>

        {/* Value with animation */}
        <div className="mb-3">
          <div
            className="text-3xl font-bold"
            style={{ color: designTokens.colors.textPrimary }}
          >
            {value}
          </div>
          {percentage !== undefined && (
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full"
              style={{ backgroundColor: designTokens.colors.borderColor }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: bgColor,
                }}
              />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="flex items-center justify-between">
          <p
            style={{ color: designTokens.colors.textSecondary }}
            className="text-xs font-semibold uppercase tracking-widest"
          >
            {label}
          </p>
          {trend !== undefined && (
            <div
              className="flex items-center gap-1"
              style={{ color: trend > 0 ? "#EF4444" : "#10B981" }}
            >
              {trend > 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="text-xs font-bold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ALERT TYPE & SEVERITY HELPERS
// ============================================================================

function getAlertIcon(alertType: string) {
  const iconMap: Record<string, React.ReactNode> = {
    VITAL: <Heart size={16} />,
    CARDIAC: <Activity size={16} />,
    RESPIRATORY: <Wind size={16} />,
    ARRHYTHMIA: <Zap size={16} />,
    HYPERTENSION: <Droplet size={16} />,
    SYMPTOM: <AlertTriangle size={16} />,
    MEDICATION: <Clock size={16} />,
  };
  return iconMap[alertType] || <AlertTriangle size={16} />;
}

function getSeverityColor(severity: string): string {
  const colorMap: Record<string, string> = {
    CRITICAL: designTokens.colors.critical,
    HIGH: designTokens.colors.high,
    MEDIUM: designTokens.colors.medium,
    LOW: designTokens.colors.low,
  };
  return colorMap[severity] || designTokens.colors.medium;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    OPEN: designTokens.colors.open,
    ACKNOWLEDGED: designTokens.colors.acknowledged,
    RESOLVED: designTokens.colors.resolved,
  };
  return colorMap[status] || designTokens.colors.textSecondary;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
}

// ============================================================================
// ALERT CARD COMPONENT
// ============================================================================

interface AlertCardProps {
  alert: AlertRecord;
  isNew: boolean;
  onAction?: (alertId: string) => void;
}

function AlertCard({ alert, isNew, onAction }: AlertCardProps) {
  const severity = alert.severity || "MEDIUM";
  const severityColor = getSeverityColor(severity);
  const statusColor = getStatusColor(alert.status);
  const patientName = alert.patient?.user
    ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`
    : "Patient inconnu";

  // Extract vital values from message if possible
  const valueMatch = alert.message.match(/(\d+[\,\/]?\d*\s*(?:mmHg|bpm|%)?)/);
  const vitals = valueMatch?.[1] || "";

  return (
    <div
      className={`group relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        isNew ? "animate-pulse" : ""
      }`}
      style={{
        backgroundColor: designTokens.colors.bgSecondary,
        border: `1px solid ${designTokens.colors.borderColor}`,
      }}
    >
      {/* "NEW" Badge */}
      {isNew && (
        <div
          className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider animate-pulse"
          style={{
            backgroundColor: `${severityColor}40`,
            color: severityColor,
          }}
        >
          <span
            className="relative inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: severityColor }}
          />
          NOUVEAU
        </div>
      )}

      <div className="flex gap-0">
        {/* Left colored bar */}
        <div
          className="w-1 rounded-tl-xl rounded-bl-xl transition-all duration-300 group-hover:w-1.5"
          style={{ backgroundColor: severityColor }}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Left section: Icon, Title, Value */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: `${severityColor}20`,
                  color: severityColor,
                }}
              >
                {getAlertIcon(alert.alertType)}
              </div>

              {/* Title and meta */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-base leading-tight"
                  style={{ color: designTokens.colors.textPrimary }}
                >
                  {alert.message.split(":")[0]}
                </h3>

                {/* Vital value highlighted */}
                {vitals && (
                  <p
                    className="mt-1 font-bold text-sm"
                    style={{ color: severityColor }}
                  >
                    {vitals}
                  </p>
                )}

                {/* Patient info */}
                <p
                  className="mt-2 text-xs"
                  style={{ color: designTokens.colors.textSecondary }}
                >
                  <strong>{patientName}</strong> • ID:{" "}
                  {alert.patientId.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Right section: Tags and action */}
          <div className="flex flex-col items-end gap-3 sm:items-end">
            {/* Tags */}
            <div className="flex flex-wrap justify-end gap-2">
              {/* Service tag */}
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${severityColor}15`,
                  color: severityColor,
                  border: `1px solid ${severityColor}30`,
                }}
              >
                {alert.alertType}
              </span>

              {/* Status tag */}
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                  border: `1px solid ${statusColor}30`,
                }}
              >
                {alert.status}
              </span>
            </div>

            {/* Time and action button */}
            <div className="flex items-center gap-3">
              <p
                className="text-xs whitespace-nowrap"
                style={{ color: designTokens.colors.textSecondary }}
              >
                {formatTime(alert.createdAt)}
              </p>

              {alert.status === "OPEN" && (
                <button
                  onClick={() => onAction?.(alert.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:gap-2 hover:shadow-lg hover:shadow-orange-500/30 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                >
                  Traiter
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
}

function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 overflow-y-auto transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: designTokens.colors.bgPrimary,
          borderRight: `1px solid ${designTokens.colors.borderColor}`,
        }}
      >
        {/* Header with Logo */}
        <div
          className="border-b p-6"
          style={{ borderColor: designTokens.colors.borderColor }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* Logo with Orange Reflection */}
            <Link
              href="/"
              className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 dark:from-white dark:to-gray-100 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
                <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-orange-700 p-2 shadow-lg shadow-orange-500/30 dark:shadow-white/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/50 dark:group-hover:shadow-white/50">
                  <AlertTriangle className="size-7 text-white animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black leading-none bg-gradient-to-r from-orange-600 via-orange-700 to-orange-700 bg-clip-text text-transparent">
                  MediFollow
                </span>
                <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-500 tracking-wider uppercase">
                  Alertes Critiques
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="size-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {[
              { label: "Dashboard", icon: Bell, href: "/dashboard/admin" },
              {
                label: "Alertes",
                icon: AlertTriangle,
                href: "/dashboard/admin/alerts",
                active: true,
                badge: 5,
              },
              {
                label: "Patients",
                icon: Activity,
                href: "/dashboard/admin/users",
              },
              {
                label: "Analyses",
                icon: TrendingUp,
                href: "/dashboard/admin/analytics",
              },
              { label: "Audit", icon: Clock, href: "/dashboard/admin/audit" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.active || false;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/10 to-orange-400/10 dark:from-orange-500/20 dark:to-orange-400/20 text-orange-600 dark:text-orange-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={onClose}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-orange-500 to-orange-400 rounded-r-full"></div>
                  )}
                  <Icon className="size-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm dark:shadow-orange-500/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Paramètres
              </p>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div
          className="border-t p-6"
          style={{ borderColor: designTokens.colors.borderColor }}
        >
          {/* System status */}
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-orange-500/10 p-3">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              SYSTÈME ACTIF
            </p>
          </div>

          {/* User actions */}
          <div className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300">
              <Settings size={16} />
              Paramètres
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// MAIN ALERTS DASHBOARD COMPONENT
// ============================================================================

interface AlertsDashboardProps {
  initialAlerts: AlertRecord[];
}

export default function AlertsDashboard({
  initialAlerts,
}: AlertsDashboardProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRecord[]>(initialAlerts);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  // Filter alerts based on search and criteria
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchSearch =
        !searchQuery ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.patient?.user?.firstName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        alert.patient?.user?.lastName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        alert.patient?.user?.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchSeverity =
        !selectedSeverity || alert.severity === selectedSeverity;
      const matchStatus = !selectedStatus || alert.status === selectedStatus;

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alerts, searchQuery, selectedSeverity, selectedStatus]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
    const open = alerts.filter((a) => a.status === "OPEN").length;
    const resolved = alerts.filter((a) => a.status === "RESOLVED").length;

    return {
      total,
      critical,
      open,
      resolved,
      criticalPercent: total > 0 ? (critical / total) * 100 : 0,
      openPercent: total > 0 ? (open / total) * 100 : 0,
    };
  }, [alerts]);

  // Refresh alerts
  const refreshAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/alerts");
      const data = await response.json();
      if (data.success && data.alerts) {
        setAlerts(
          data.alerts.map((alert: any) => ({
            ...alert,
            createdAt: new Date(alert.createdAt),
            resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
            acknowledgedAt: alert.acknowledgedAt
              ? new Date(alert.acknowledgedAt)
              : null,
          }))
        );
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to refresh alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 30000);
    return () => clearInterval(interval);
  }, [refreshAlerts]);

  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const statuses = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: designTokens.colors.bgPrimary }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header
          className="sticky top-0 z-30 border-b backdrop-blur-sm"
          style={{
            backgroundColor: `${designTokens.colors.bgPrimary}E6`,
            borderColor: designTokens.colors.borderColor,
          }}
        >
          <div className="flex items-center justify-between gap-4 p-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
              style={{ color: designTokens.colors.textSecondary }}
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 via-orange-700 to-orange-700 bg-clip-text text-transparent">
              Gestion d'Alertes
            </h1>

            <div className="flex items-center gap-3">
              <p
                className="text-xs whitespace-nowrap"
                style={{ color: designTokens.colors.textSecondary }}
              >
                Mis à jour: {formatTime(lastUpdate)}
              </p>
              <button
                onClick={refreshAlerts}
                disabled={loading}
                className="rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
              >
                {loading ? "..." : "Actualiser"}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 lg:p-8">
          {/* Metrics Section */}
          <section className="mb-8">
            <h2 className="mb-6 text-xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-orange-700 bg-clip-text text-transparent">
              Métriques Clés
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Alertes"
                value={metrics.total}
                icon={<AlertTriangle size={20} />}
                color="high"
                percentage={100}
              />
              <MetricCard
                label="Critiques"
                value={metrics.critical}
                icon={<AlertTriangle size={20} />}
                color="critical"
                percentage={metrics.criticalPercent}
                trend={5}
              />
              <MetricCard
                label="En Attente"
                value={metrics.open}
                icon={<Clock size={20} />}
                color="high"
                percentage={metrics.openPercent}
              />
              <MetricCard
                label="Traitées"
                value={metrics.resolved}
                icon={<CheckCircle2 size={20} />}
                color="resolved"
                percentage={100}
                trend={-3}
              />
            </div>
          </section>

          {/* Filters Section */}
          <section className="mb-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              Filtres & Recherche
            </h3>

            {/* Search bar */}
            <div className="mb-6 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: designTokens.colors.textSecondary }}
              />
              <input
                type="text"
                placeholder="Rechercher par patient, email, ou type d'alerte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border pl-11 pr-4 py-3 text-sm transition-colors outline-none focus:ring-2 focus:ring-orange-500/50"
                style={
                  {
                    backgroundColor: designTokens.colors.bgSecondary,
                    borderColor: designTokens.colors.borderColor,
                    color: designTokens.colors.textPrimary,
                  } as any
                }
              />
            </div>

            {/* Severity filters */}
            <div className="mb-4">
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: designTokens.colors.textSecondary }}
              >
                Sévérité
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "CRITICAL",
                    color: designTokens.colors.critical,
                    count: alerts.filter((a) => a.severity === "CRITICAL")
                      .length,
                  },
                  {
                    label: "HIGH",
                    color: designTokens.colors.high,
                    count: alerts.filter((a) => a.severity === "HIGH").length,
                  },
                  {
                    label: "MEDIUM",
                    color: designTokens.colors.medium,
                    count: alerts.filter((a) => a.severity === "MEDIUM").length,
                  },
                  {
                    label: "LOW",
                    color: designTokens.colors.low,
                    count: alerts.filter((a) => a.severity === "LOW").length,
                  },
                ].map(({ label, color, count }) => (
                  <button
                    key={label}
                    onClick={() =>
                      setSelectedSeverity(
                        selectedSeverity === label ? null : label
                      )
                    }
                    className="relative rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor:
                        selectedSeverity === label
                          ? `${color}30`
                          : `${color}15`,
                      color: color,
                      border: `1px solid ${selectedSeverity === label ? color : `${color}40`}`,
                    }}
                  >
                    {label}
                    <span
                      className="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-black"
                      style={{
                        backgroundColor: `${color}40`,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status filters */}
            <div>
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: designTokens.colors.textSecondary }}
              >
                Statut
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "OPEN",
                    color: designTokens.colors.open,
                    count: alerts.filter((a) => a.status === "OPEN").length,
                  },
                  {
                    label: "ACKNOWLEDGED",
                    color: designTokens.colors.acknowledged,
                    count: alerts.filter((a) => a.status === "ACKNOWLEDGED")
                      .length,
                  },
                  {
                    label: "RESOLVED",
                    color: designTokens.colors.resolved,
                    count: alerts.filter((a) => a.status === "RESOLVED").length,
                  },
                ].map(({ label, color, count }) => (
                  <button
                    key={label}
                    onClick={() =>
                      setSelectedStatus(selectedStatus === label ? null : label)
                    }
                    className="relative rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor:
                        selectedStatus === label ? `${color}30` : `${color}15`,
                      color: color,
                      border: `1px solid ${selectedStatus === label ? color : `${color}40`}`,
                    }}
                  >
                    {label}
                    <span
                      className="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-black"
                      style={{
                        backgroundColor: `${color}40`,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Alerts List */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-orange-700 bg-clip-text text-transparent">
                Alertes Actives
              </h3>
              <p
                style={{ color: designTokens.colors.textSecondary }}
                className="text-sm"
              >
                {filteredAlerts.length} résultat
                {filteredAlerts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredAlerts.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed p-12 text-center"
                style={{
                  borderColor: designTokens.colors.borderColor,
                }}
              >
                <AlertTriangle
                  size={32}
                  className="mx-auto mb-4"
                  style={{ color: designTokens.colors.textSecondary }}
                />
                <p
                  style={{ color: designTokens.colors.textSecondary }}
                  className="text-sm"
                >
                  {searchQuery || selectedSeverity || selectedStatus
                    ? "Aucune alerte ne correspond à vos filtres"
                    : "Aucune alerte active"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts
                  .sort((a, b) => {
                    // Sort by severity level first
                    const severityOrder = {
                      CRITICAL: 0,
                      HIGH: 1,
                      MEDIUM: 2,
                      LOW: 3,
                    };
                    const severityA =
                      severityOrder[a.severity as keyof typeof severityOrder] ??
                      4;
                    const severityB =
                      severityOrder[b.severity as keyof typeof severityOrder] ??
                      4;
                    if (severityA !== severityB) return severityA - severityB;
                    // Then by date
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })
                  .map((alert, index) => {
                    const isNew =
                      new Date().getTime() -
                        new Date(alert.createdAt).getTime() <
                      5 * 60000;
                    return (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        isNew={isNew}
                        onAction={(id) => {
                          // TODO: Implement action
                          console.log("Action for alert:", id);
                        }}
                      />
                    );
                  })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
