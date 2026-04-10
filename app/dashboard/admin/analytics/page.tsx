"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { div } from "three/src/nodes/math/OperatorNode.js";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    openAlerts: 0,
    resolvedAlerts: 0,
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    // Simulated data - replace with real API calls
    const mockStats = {
      totalAlerts: 47,
      criticalAlerts: 8,
      openAlerts: 19,
      resolvedAlerts: 28,
      totalUsers: 156,
      totalDoctors: 12,
      totalPatients: 144,
    };
    setStats(mockStats);
  }, []);

  // Mock chart data
  const alertTrend = [
    { day: "Lun", alerts: 12, resolved: 8 },
    { day: "Mar", alerts: 15, resolved: 10 },
    { day: "Mer", alerts: 10, resolved: 8 },
    { day: "Jeu", alerts: 18, resolved: 14 },
    { day: "Ven", alerts: 14, resolved: 11 },
    { day: "Sam", alerts: 9, resolved: 7 },
    { day: "Dim", alerts: 8, resolved: 5 },
  ];

  const severityDistribution = [
    { name: "CRITIQUE", value: 8, fill: "#ef4444" },
    { name: "HAUTE", value: 15, fill: "#f97316" },
    { name: "MOYENNE", value: 16, fill: "#eab308" },
    { name: "BASSE", value: 8, fill: "#3b82f6" },
  ];

  const userDistribution = [
    { name: "Patients", value: 144, fill: "#3b82f6" },
    { name: "Docteurs", value: 12, fill: "#53FC18" },
    { name: "Admins", value: 3, fill: "#ef4444" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analyses et Rapports
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Vue d'ensemble complète des métriques système
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group glass-panel rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-gradient-to-br from-cyan-50 dark:from-cyan-500/5 to-slate-50 dark:to-slate-900/50 p-6 hover:shadow-lg hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Total Alertes
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalAlerts}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Depuis le début du mois
          </p>
        </div>

        <div className="group glass-panel rounded-xl border border-slate-200 dark:border-red-500/20 bg-gradient-to-br from-red-50 dark:from-red-500/5 to-slate-50 dark:to-slate-900/50 p-6 hover:shadow-lg hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Critiques
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.criticalAlerts}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nécessitant une attention immédiate
          </p>
        </div>

        <div className="group glass-panel rounded-xl border border-slate-200 dark:border-green-400/20 bg-gradient-to-br from-green-50 dark:from-green-400/5 to-slate-50 dark:to-slate-900/50 p-6 hover:shadow-lg hover:border-green-400/40 dark:hover:border-green-400/40 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Résolues
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.resolvedAlerts}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-400/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
              {Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Taux de résolution
            </span>
          </div>
        </div>

        <div className="group glass-panel rounded-xl border border-slate-200 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 dark:from-blue-500/5 to-slate-50 dark:to-slate-900/50 p-6 hover:shadow-lg hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Utilisateurs
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.totalDoctors} docteurs • {stats.totalPatients} patients
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Trend */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            📈 Tendance des Alertes (7 jours)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={alertTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#475569"
                opacity={0.3}
              />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8" }} />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 5 }}
                activeDot={{ r: 7 }}
                name="Ouvertes"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#53FC18"
                strokeWidth={2}
                dot={{ fill: "#53FC18", r: 5 }}
                activeDot={{ r: 7 }}
                name="Résolues"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            🎯 Distribution par Sévérité
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Alert Distribution */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            ⏱️ Alertes par Heure
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { time: "00h", count: 2 },
                { time: "04h", count: 1 },
                { time: "08h", count: 5 },
                { time: "12h", count: 8 },
                { time: "16h", count: 12 },
                { time: "20h", count: 7 },
                { time: "23h", count: 3 },
              ]}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#475569"
                opacity={0.3}
              />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Bar
                dataKey="count"
                fill="#79B5EC"
                radius={[8, 8, 0, 0]}
                name="Nombre d'alertes"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            👥 Distribution des Utilisateurs
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          📊 Résumé Statistique
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  Métrique
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  Valeur
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  Changement
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4 text-slate-900 dark:text-slate-100">
                  Alertes Ouvertes
                </td>
                <td className="py-4 px-4 text-right text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.openAlerts}
                </td>
                <td className="py-4 px-4 text-right text-red-600 dark:text-red-400">
                  ↑ 5%
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4 text-slate-900 dark:text-slate-100">
                  Taux de Résolution
                </td>
                <td className="py-4 px-4 text-right text-lg font-bold text-green-600 dark:text-green-400">
                  {Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100)}
                  %
                </td>
                <td className="py-4 px-4 text-right text-green-600 dark:text-green-400">
                  ↑ 3%
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4 text-slate-900 dark:text-slate-100">
                  Alertes Critiques
                </td>
                <td className="py-4 px-4 text-right text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.criticalAlerts}
                </td>
                <td className="py-4 px-4 text-right text-red-600 dark:text-red-400">
                  → 0%
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4 text-slate-900 dark:text-slate-100">
                  Utilisateurs Actifs
                </td>
                <td className="py-4 px-4 text-right text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.totalUsers}
                </td>
                <td className="py-4 px-4 text-right text-cyan-600 dark:text-cyan-400">
                  ↑ 2%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
