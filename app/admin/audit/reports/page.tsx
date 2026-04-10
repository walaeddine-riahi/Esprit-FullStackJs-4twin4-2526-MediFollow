"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

import { getAuditLogs } from "@/lib/actions/audit.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuditReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "all",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (
          !currentUser ||
          (currentUser.role !== "ADMIN" &&
            currentUser.role !== ("AUDITOR" as any))
        ) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        const auditLogs = await getAuditLogs();
        setLogs(auditLogs || []);
      } catch (error) {
        console.error("Error loading logs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const getFilteredData = () => {
    let filtered = [...logs];

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) <= end);
    }

    return filtered;
  };

  const filteredLogs = getFilteredData();

  const generateCSVReport = () => {
    const data = filteredLogs;
    const headers = [
      "Utilisateur",
      "Action",
      "Entité",
      "ID Entité",
      "Date",
      "Statut",
    ];
    const rows = data.map((log) => [
      log.user?.email || "Unknown",
      log.action,
      log.entityType,
      log.entityId,
      new Date(log.timestamp).toLocaleString("fr-FR"),
      log.status || "SUCCESS",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const generatePDFReport = () => {
    const data = filteredLogs;
    let content = "RAPPORT D'AUDIT\n";
    content += `Généré le: ${new Date().toLocaleString("fr-FR")}\n`;
    content += `Période: ${filters.startDate || "Début"} à ${filters.endDate || "Fin"}\n`;
    content += `Nombre d'entrées: ${data.length}\n\n`;
    content += "=".repeat(80) + "\n\n";

    data.forEach((log) => {
      content += `Utilisateur: ${log.user?.email || "Unknown"}\n`;
      content += `Action: ${log.action}\n`;
      content += `Entité: ${log.entityType} (ID: ${log.entityId})\n`;
      content += `Date: ${new Date(log.timestamp).toLocaleString("fr-FR")}\n`;
      content += `Statut: ${log.status || "SUCCESS"}\n`;
      content += "-".repeat(80) + "\n\n";
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  const stats = {
    total: logs.length,
    filtered: filteredLogs.length,
    byAction: logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <FileText
            size={32}
            className="text-purple-600 dark:text-purple-400"
          />
          Rapports d'Audit
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Générez et téléchargez des rapports d'audit personnalisés
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total des Entrées
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.filtered}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entrées Filtrées
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Object.keys(stats.byAction).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Types d'Actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Filter size={20} />
            Filtres de Rapport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Début
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Fin
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Download size={20} />
            Exporter les Rapports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateCSVReport}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              📊 Télécharger CSV
            </Button>
            <Button
              onClick={generatePDFReport}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              📄 Télécharger TXT
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Exporte {filteredLogs.length} entrée(s) selon les filtres
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
