"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Download, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { getAuditLogs } from "@/lib/actions/audit.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AuditLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

        const endDate = new Date();
        const startDate = new Date(
          endDate.getTime() - 90 * 24 * 60 * 60 * 1000
        );

        const auditLogs = await getAuditLogs({
          limit: 500,
          startDate,
          endDate,
        });
        setLogs(auditLogs || []);
      } catch (error) {
        console.error("Error loading logs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.user?.email?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.entityType?.toLowerCase().includes(query)
    );
  });

  function getSeverityColor(action: string) {
    if (action.includes("DELETE")) return "destructive";
    if (action.includes("UPDATE")) return "secondary";
    if (action.includes("CREATE")) return "default";
    return "outline";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Journaux d'Audit
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredLogs.length} entrées • Derniers 90 jours
        </p>
      </div>

      {/* Search Bar */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Rechercher par utilisateur, action ou entité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 dark:text-white">
              Journaux d'Audit
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <Download size={16} className="mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800">
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Date & Heure
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Utilisateur
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Action
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Entité
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    ID
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                        {log.timestamp
                          ? format(
                              new Date(log.timestamp),
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.user?.email || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(log.action) as any}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                        {log.entityType}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {log.entityId?.substring(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
