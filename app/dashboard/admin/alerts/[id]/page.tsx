"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowLeft,
  User,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Edit,
  Save,
  X,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAlertById, acknowledgeAlert, resolveAlert } from "@/lib/actions/alert.actions";

interface Alert {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  patientId: string;
  data?: any;
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

export default function AlertDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [resolution, setResolution] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);

  useEffect(() => {
    checkAuthAndLoadAlert();
  }, []);

  async function checkAuthAndLoadAlert() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const result = await getAlertById(params.id);
      if (result.success && result.alert) {
        // Mapper les données
        const mappedAlert: Alert = {
          id: result.alert.id,
          alertType: result.alert.alertType,
          severity: result.alert.severity,
          status: result.alert.status,
          message: result.alert.message,
          createdAt: result.alert.createdAt,
          acknowledgedAt: result.alert.acknowledgedAt,
          resolvedAt: result.alert.resolvedAt,
          resolution: result.alert.resolution,
          patientId: result.alert.patientId,
          data: result.alert.data,
          patient: result.alert.patient ? {
            user: {
              id: result.alert.patient.user.id,
              email: result.alert.patient.user.email,
              firstName: result.alert.patient.user.firstName,
              lastName: result.alert.patient.user.lastName,
              phoneNumber: result.alert.patient.user.phoneNumber,
            }
          } : undefined,
          acknowledgedBy: result.alert.acknowledgedBy ? {
            firstName: result.alert.acknowledgedBy.firstName,
            lastName: result.alert.acknowledgedBy.lastName,
          } : null,
          resolvedBy: result.alert.resolvedBy ? {
            firstName: result.alert.resolvedBy.firstName,
            lastName: result.alert.resolvedBy.lastName,
          } : null,
        };
        setAlert(mappedAlert);
      }
    } catch (error) {
      console.error("Error loading alert:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge() {
    try {
      setUpdating(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      
      const result = await acknowledgeAlert(params.id, currentUser.id);
      if (result.success && result.alert) {
        // Mettre à jour l'alerte
        setAlert({
          ...alert!,
          status: result.alert.status,
          acknowledgedAt: result.alert.acknowledgedAt,
          acknowledgedBy: {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          },
        });
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (!resolution.trim()) return;
    
    try {
      setUpdating(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      
      const result = await resolveAlert(params.id, currentUser.id, resolution);
      if (result.success && result.alert) {
        setAlert({
          ...alert!,
          status: result.alert.status,
          resolvedAt: result.alert.resolvedAt,
          resolution: result.alert.resolution,
          resolvedBy: {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          },
        });
        setShowResolveForm(false);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    } finally {
      setUpdating(false);
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle size={24} className="text-red-600" />;
      case "HIGH":
        return <AlertTriangle size={24} className="text-orange-600" />;
      case "MEDIUM":
        return <AlertCircle size={24} className="text-yellow-600" />;
      case "LOW":
        return <Info size={24} className="text-blue-600" />;
      default:
        return <AlertCircle size={24} />;
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
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ACKNOWLEDGED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESOLVED":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "OPEN":
        return <AlertCircle size={20} className="text-orange-600" />;
      case "ACKNOWLEDGED":
        return <Clock size={20} className="text-blue-600" />;
      case "RESOLVED":
        return <CheckCircle size={20} className="text-green-600" />;
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

  function getVitalIcon(vitalType: string) {
    switch (vitalType) {
      case "systolicBP":
      case "diastolicBP":
        return <Gauge size={16} className="text-red-600" />;
      case "heartRate":
        return <Heart size={16} className="text-red-600" />;
      case "temperature":
        return <Thermometer size={16} className="text-orange-600" />;
      case "oxygenSaturation":
        return <Wind size={16} className="text-blue-600" />;
      case "respiratoryRate":
        return <Activity size={16} className="text-green-600" />;
      default:
        return <Activity size={16} />;
    }
  }

  function getVitalLabel(vitalType: string) {
    switch (vitalType) {
      case "systolicBP":
        return "Pression systolique";
      case "diastolicBP":
        return "Pression diastolique";
      case "heartRate":
        return "Fréquence cardiaque";
      case "temperature":
        return "Température";
      case "oxygenSaturation":
        return "Saturation en oxygène";
      case "respiratoryRate":
        return "Fréquence respiratoire";
      default:
        return vitalType;
    }
  }

  function getVitalUnit(vitalType: string) {
    switch (vitalType) {
      case "systolicBP":
      case "diastolicBP":
        return "mmHg";
      case "heartRate":
        return "bpm";
      case "temperature":
        return "°C";
      case "oxygenSaturation":
        return "%";
      case "respiratoryRate":
        return "/min";
      default:
        return "";
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

  if (!alert) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-2xl text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Alerte non trouvée
          </h1>
          <p className="text-gray-600 mb-6">
            L'alerte que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/dashboard/admin/alerts"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin/alerts"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Détails de l'alerte
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {alert.status === "OPEN" && (
                <button
                  onClick={handleAcknowledge}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Clock size={16} />
                  Reconnaître
                </button>
              )}
              {alert.status !== "RESOLVED" && (
                <button
                  onClick={() => setShowResolveForm(true)}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Résoudre
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* Alert Card */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Severity Header */}
          <div className={`p-6 ${getSeverityColor(alert.severity)} border-b`}>
            <div className="flex items-center gap-4">
              {getSeverityIcon(alert.severity)}
              <div>
                <h2 className="text-xl font-semibold">
                  Alerte {getSeverityLabel(alert.severity)}
                </h2>
                <p className="text-sm opacity-90">{alert.alertType}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(alert.status)}`}>
                  {getStatusIcon(alert.status)}
                  {getStatusLabel(alert.status)}
                </span>
                <span className="text-sm text-gray-600">
                  Créée le {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-900 text-lg">{alert.message}</p>
            </div>

            {/* Vital Signs Data */}
            {alert.data && alert.data.vitalType && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Constantes vitales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      {getVitalIcon(alert.data.vitalType)}
                      <span className="font-medium">{getVitalLabel(alert.data.vitalType)}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {alert.data.value} {getVitalUnit(alert.data.vitalType)}
                      </span>
                      {alert.data.threshold && (
                        <span className="text-sm text-gray-600">
                          Seuil: {alert.data.threshold.min} - {alert.data.threshold.max} {getVitalUnit(alert.data.vitalType)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Chronologie</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alerte créée</p>
                    <p className="text-sm text-gray-600">
                      {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {alert.acknowledgedAt && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Alerte reconnue</p>
                      <p className="text-sm text-gray-600">
                        {new Date(alert.acknowledgedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {alert.acknowledgedBy && (
                        <p className="text-sm text-gray-600">
                          Par {alert.acknowledgedBy.firstName} {alert.acknowledgedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {alert.resolvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Alerte résolue</p>
                      <p className="text-sm text-gray-600">
                        {new Date(alert.resolvedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {alert.resolvedBy && (
                        <p className="text-sm text-gray-600">
                          Par {alert.resolvedBy.firstName} {alert.resolvedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution */}
            {alert.resolution && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Résolution</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{alert.resolution}</p>
                </div>
              </div>
            )}

            {/* Patient Info */}
            {alert.patient && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Patient concerné</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium text-gray-900">
                        {alert.patient.user.firstName} {alert.patient.user.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Mail size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{alert.patient.user.email}</p>
                    </div>
                  </div>

                  {alert.patient.user.phoneNumber && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Phone size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900">{alert.patient.user.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Résoudre l'alerte
              </h2>
              <button
                onClick={() => setShowResolveForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-6">
              <div className="mb-4">
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">
                  Description de la résolution
                </label>
                <textarea
                  id="resolution"
                  rows={4}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Expliquez comment cette alerte a été résolue..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updating || !resolution.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {updating ? "Résolution..." : "Confirmer la résolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}