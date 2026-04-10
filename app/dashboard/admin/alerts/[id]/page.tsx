"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAlertById, updateAlertStatus } from "@/lib/actions/alert.actions";
import { AlertStatus } from "@/types/medifollow.types";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadAlert();
  }, [params.id]);

  async function loadAlert() {
    try {
      const result = await getAlertById(params.id as string);
      if (result.success && result.alert) {
        setAlert(result.alert);
        setNotes(result.alert.resolution || "");
      }
    } catch (error) {
      console.error("Error loading alert:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    setUpdating(true);
    try {
      const result = await updateAlertStatus(params.id as string, newStatus);
      if (result.success) {
        setAlert({ ...alert, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating alert:", error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">Alerte non trouvée</p>
      </div>
    );
  }

  const severityColors = {
    CRITICAL:
      "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700",
    HIGH: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 border-orange-300 dark:border-orange-700",
    MEDIUM:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700",
    LOW: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700",
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <ArrowLeft size={20} />
        Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          {/* Header */}
          <div
            className={`glass-panel rounded-xl border-2 p-6 ${severityColors[alert.severity as keyof typeof severityColors] || severityColors.LOW}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{alert.message}</h1>
                <p className="mt-2 opacity-80">Patient ID: {alert.patientId}</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-white/20 font-semibold text-sm">
                {alert.severity}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  État
                </label>
                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                  {alert.status}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Type
                </label>
                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                  {alert.type || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Créée
                </label>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {new Date(alert.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Mise à jour
                </label>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {new Date(alert.updatedAt).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={20} />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Notes
              </h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes..."
              className="w-full h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Actions
            </h3>

            <button
              onClick={() => handleStatusUpdate(AlertStatus.ACKNOWLEDGED)}
              disabled={updating || alert.status === AlertStatus.ACKNOWLEDGED}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 size={18} />
              Reconnaître
            </button>

            <button
              onClick={() => handleStatusUpdate(AlertStatus.RESOLVED)}
              disabled={updating || alert.status === AlertStatus.RESOLVED}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 size={18} />
              Résoudre
            </button>

            <button
              onClick={() => handleStatusUpdate(AlertStatus.OPEN)}
              disabled={updating || alert.status === AlertStatus.OPEN}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <AlertCircle size={18} />
              Rouvrir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
