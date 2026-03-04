"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Search,
  Filter,
  Clock,
  User,
  Calendar,
  ChevronRight,
  Activity,
  Shield,
  AlertCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
}

export default function AdminAuditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      
      // Simuler des données d'audit
      const mockLogs: AuditLog[] = [
        {
          id: "1",
          action: "CONNEXION",
          userId: "user1",
          userEmail: "admin@example.com",
          userName: "Admin User",
          timestamp: new Date(),
          details: "Connexion réussie",
          ipAddress: "192.168.1.1",
        },
        {
          id: "2",
          action: "CRÉATION_UTILISATEUR",
          userId: "user2",
          userEmail: "doctor@example.com",
          userName: "Dr. Smith",
          timestamp: new Date(Date.now() - 3600000),
          details: "Création d'un nouveau médecin",
          ipAddress: "192.168.1.2",
        },
        {
          id: "3",
          action: "MODIFICATION_ALERTE",
          userId: "user3",
          userEmail: "nurse@example.com",
          userName: "Nurse Jane",
          timestamp: new Date(Date.now() - 7200000),
          details: "Modification des seuils d'alerte",
          ipAddress: "192.168.1.3",
        },
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  function getActionIcon(action: string) {
    switch (action) {
      case "CONNEXION":
        return <Activity size={16} className="text-blue-600" />;
      case "CRÉATION_UTILISATEUR":
        return <User size={16} className="text-green-600" />;
      case "MODIFICATION_ALERTE":
        return <AlertCircle size={16} className="text-orange-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  }

  function getActionColor(action: string) {
    switch (action) {
      case "CONNEXION":
        return "bg-blue-100 text-blue-700";
      case "CRÉATION_UTILISATEUR":
        return "bg-green-100 text-green-700";
      case "MODIFICATION_ALERTE":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Chargement...</p>
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
                Journal d'Audit
              </h1>
              <p className="text-sm text-gray-600">
                Historique des actions sur la plateforme
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les logs..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filtres rapides:</span>
            </div>
            <button className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Connexions
            </button>
            <button className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Créations
            </button>
            <button className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Modifications
            </button>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      <Clock size={12} className="inline mr-1" />
                      {new Date(log.timestamp).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>

                  <p className="text-gray-900 mb-1">{log.details}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {log.userName} ({log.userEmail})
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={14} />
                      {log.ipAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(log.timestamp).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-gray-900">{logs.length}</span> entrées
            </p>
            <p className="text-sm text-gray-600">
              Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}