import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  Heart,
  Thermometer,
  Wind,
  Scale,
<<<<<<< HEAD
  TrendingUp,
  User,
  Calendar,
  FileText,
=======
>>>>>>> ai-features-backup
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import VitalReviewForm from "./vital-review-form";
<<<<<<< HEAD
import AlertResponsePanel from "./alert-response-panel";
=======
>>>>>>> ai-features-backup

async function getAlert(alertId: string) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        triggeredBy: true,
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });
    return alert as any;
  } catch (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
}

async function getVitalRecord(vitalId: string) {
  try {
    const vital = await prisma.vitalRecord.findUnique({
      where: { id: vitalId },
    });
    return vital as any;
  } catch (error) {
    console.error("Error fetching vital record:", error);
    return null;
  }
}

async function acknowledgeAlert(alertId: string, userId: string) {
  "use server";

  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedById: userId,
        acknowledgedAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return { success: false, error: "Erreur lors de l'accusé de réception" };
  }
}

async function resolveAlert(alertId: string, userId: string, notes: string) {
  "use server";

  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedById: userId,
        resolvedAt: new Date(),
        resolution: notes,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error resolving alert:", error);
    return { success: false, error: "Erreur lors de la résolution" };
  }
}

export default async function AlertDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const alert = await getAlert(params.id);

  if (!alert) {
    notFound();
  }

  // Récupérer les détails du vital record si disponible
  let vitalRecord: any = null;
  if ((alert as any).vitalRecordId) {
    vitalRecord = await getVitalRecord((alert as any).vitalRecordId);
  }

  const patientName = `${alert.patient.user.firstName} ${alert.patient.user.lastName}`;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "ACKNOWLEDGED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getVitalStatusBgColor = (status: string) => {
    switch (status) {
      case "CRITIQUE":
        return "bg-red-100 border-red-300";
      case "A_VERIFIER":
        return "bg-orange-100 border-orange-300";
      case "NORMAL":
        return "bg-green-100 border-green-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard/doctor/alerts"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Navigation */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/dashboard/doctor/alerts"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
>>>>>>> ai-features-backup
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux alertes
          </Link>
<<<<<<< HEAD
          <div className="flex items-center gap-3">
            <Badge
              className={`${
                alert.severity === "CRITICAL"
                  ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                  : alert.severity === "HIGH"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
                    : alert.severity === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
              }`}
            >
              {alert.severity}
            </Badge>
            <Badge
              className={`${
                alert.status === "RESOLVED"
                  ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                  : alert.status === "ACKNOWLEDGED"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                    : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
              }`}
            >
              {alert.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Alert Summary Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {alert.message}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Type:</strong> {alert.alertType} •{" "}
                  <strong>Créée le:</strong>{" "}
                  {new Date(alert.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              {alert.severity === "CRITICAL" && (
                <AlertCircle className="w-12 h-12 text-red-500 flex-shrink-0 ml-4" />
              )}
            </div>

            {/* Patient & Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Patient
                  </p>
                  <Link
                    href={`/dashboard/doctor/patients/${alert.patient.id}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    {patientName}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    MRN: {alert.patient.medicalRecordNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date d'alerte
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(alert.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vital Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vital Record Card */}
            {vitalRecord && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div
                  className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
                    vitalRecord.status === "CRITIQUE"
                      ? "bg-red-50 dark:bg-red-500/10"
                      : vitalRecord.status === "A_VERIFIER"
                        ? "bg-orange-50 dark:bg-orange-500/10"
                        : "bg-green-50 dark:bg-green-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Signes vitaux
                      </h2>
                    </div>
                    <Badge
                      className={`text-sm font-medium ${
                        vitalRecord.status === "CRITIQUE"
                          ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                          : vitalRecord.status === "A_VERIFIER"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
                            : "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
=======
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alert & Vital Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Header Card */}
            <div
              className={`rounded-xl backdrop-blur-xl border-2 overflow-hidden ${
                alert.severity === "CRITICAL"
                  ? "border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10"
                  : "border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10"
              }`}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        className={`${
                          alert.severity === "CRITICAL"
                            ? "bg-red-500 text-white"
                            : alert.severity === "HIGH"
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                      <Badge
                        className={`${
                          alert.status === "RESOLVED"
                            ? "bg-green-500 text-white"
                            : alert.status === "ACKNOWLEDGED"
                              ? "bg-blue-500 text-white"
                              : "bg-red-500 text-white"
                        }`}
                      >
                        {alert.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {alert.message}
                    </h1>
                    <p className="text-gray-400 text-sm">
                      Type: {alert.alertType}
                    </p>
                  </div>
                  {alert.severity === "CRITICAL" && (
                    <AlertCircle className="w-16 h-16 text-red-500/80 flex-shrink-0" />
                  )}
                </div>

                {/* Alert Info Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Patient</p>
                    <Link
                      href={`/dashboard/doctor/patients/${alert.patient.id}`}
                      className="text-white font-semibold hover:text-blue-300 transition-colors"
                    >
                      {patientName}
                    </Link>
                    <p className="text-gray-500 text-xs mt-1">
                      MRN: {alert.patient.medicalRecordNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Date de création
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(alert.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vital Record Card */}
            {vitalRecord && (
              <div
                className={`rounded-xl backdrop-blur-xl border-2 overflow-hidden ${
                  vitalRecord.status === "CRITIQUE"
                    ? "border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10"
                    : vitalRecord.status === "A_VERIFIER"
                      ? "border-orange-500/50 bg-gradient-to-br from-orange-900/20 to-orange-800/10"
                      : "border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10"
                }`}
              >
                <div className="p-8">
                  {/* Vital Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Signes vitaux
                    </h2>
                    <Badge
                      className={`text-lg px-4 py-2 ${
                        vitalRecord.status === "CRITIQUE"
                          ? "bg-red-500 text-white"
                          : vitalRecord.status === "A_VERIFIER"
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
>>>>>>> ai-features-backup
                      }`}
                    >
                      {vitalRecord.status === "CRITIQUE"
                        ? "🔴 CRITIQUE"
                        : vitalRecord.status === "A_VERIFIER"
                          ? "🟡 À VÉRIFIER"
                          : "🟢 NORMAL"}
                    </Badge>
                  </div>
<<<<<<< HEAD
                </div>

                <div className="p-6">
                  {/* Vital Measurements Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {(vitalRecord.systolicBP || vitalRecord.diastolicBP) && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Tension Artérielle
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {vitalRecord.systolicBP}/{vitalRecord.diastolicBP}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          mmHg
                        </p>
=======

                  {/* Vital Measurements - Improved Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {(vitalRecord.systolicBP || vitalRecord.diastolicBP) && (
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-5 h-5 text-blue-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Tension
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.systolicBP}/{vitalRecord.diastolicBP}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">mmHg</p>
>>>>>>> ai-features-backup
                      </div>
                    )}

                    {vitalRecord.heartRate && (
<<<<<<< HEAD
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Fréquence Cardiaque
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {vitalRecord.heartRate}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          bpm
                        </p>
=======
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-5 h-5 text-red-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Fréquence
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.heartRate}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">bpm</p>
>>>>>>> ai-features-backup
                      </div>
                    )}

                    {vitalRecord.temperature && (
<<<<<<< HEAD
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-4 h-4 text-yellow-500" />
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Température
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {vitalRecord.temperature}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          °C
                        </p>
=======
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-orange-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Thermometer className="w-5 h-5 text-orange-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Température
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.temperature}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">°C</p>
>>>>>>> ai-features-backup
                      </div>
                    )}

                    {vitalRecord.oxygenSaturation && (
<<<<<<< HEAD
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-4 h-4 text-cyan-500" />
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            SpO₂
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {vitalRecord.oxygenSaturation}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          %
                        </p>
=======
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-cyan-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Wind className="w-5 h-5 text-cyan-400" />
                          <p className="text-xs font-medium text-gray-300">
                            SpO2
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.oxygenSaturation}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">%</p>
>>>>>>> ai-features-backup
                      </div>
                    )}

                    {vitalRecord.weight && (
<<<<<<< HEAD
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-green-500" />
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Poids
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {vitalRecord.weight}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          kg
                        </p>
=======
                      <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Scale className="w-5 h-5 text-green-400" />
                          <p className="text-xs font-medium text-gray-300">
                            Poids
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {vitalRecord.weight}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">kg</p>
>>>>>>> ai-features-backup
                      </div>
                    )}
                  </div>

<<<<<<< HEAD
                  {/* Patient Notes */}
                  {vitalRecord.notes && (
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notes du patient
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {vitalRecord.notes}
                      </p>
                    </div>
                  )}

                  {/* Review Status */}
                  {vitalRecord.reviewStatus === "REVIEWED" && (
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                        ✅ Vital examiné
                      </p>
                      {vitalRecord.reviewedBy && (
                        <p className="text-xs text-green-700 dark:text-green-400 mb-1">
=======
                  {/* Recorded Date */}
                  <div className="text-sm text-gray-400 mb-4 pt-4 border-t border-white/10">
                    <strong className="text-gray-300">Enregistré le:</strong>{" "}
                    {new Date(vitalRecord.recordedAt).toLocaleString("fr-FR")}
                  </div>

                  {/* Patient Notes */}
                  {vitalRecord.notes && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-sm font-semibold text-gray-300 mb-2">
                        📝 Notes du patient
                      </p>
                      <p className="text-gray-300">{vitalRecord.notes}</p>
                    </div>
                  )}

                  {/* Doctor Review Status - Already Reviewed */}
                  {vitalRecord.reviewStatus === "REVIEWED" && (
                    <div className="mt-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-300 mb-2">
                        ✅ Vital reviewé
                      </p>
                      {vitalRecord.reviewedBy && (
                        <p className="text-xs text-green-400 mb-2">
>>>>>>> ai-features-backup
                          Par: Dr. {vitalRecord.reviewedBy.firstName}{" "}
                          {vitalRecord.reviewedBy.lastName}
                        </p>
                      )}
                      {vitalRecord.reviewNotes && (
<<<<<<< HEAD
                        <p className="text-sm text-green-800 dark:text-green-300 mb-2">
=======
                        <p className="text-sm text-green-300 mb-2">
>>>>>>> ai-features-backup
                          {vitalRecord.reviewNotes}
                        </p>
                      )}
                      {vitalRecord.reviewedAt && (
<<<<<<< HEAD
                        <p className="text-xs text-green-700 dark:text-green-400">
=======
                        <p className="text-xs text-green-400">
>>>>>>> ai-features-backup
                          {new Date(vitalRecord.reviewedAt).toLocaleString(
                            "fr-FR"
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Review Form */}
          {vitalRecord && (
            <div className="lg:col-span-1">
              <VitalReviewForm
                vitalRecord={vitalRecord}
                doctorId={user.id}
                alertId={alert.id}
              />
            </div>
          )}
        </div>

        {/* Timeline Section */}
<<<<<<< HEAD
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chronologie
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Alert Created */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 border-2 border-red-300 dark:border-red-500/50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  {(alert.acknowledgedAt || alert.resolvedAt) && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-red-300 dark:from-red-500/50 to-gray-300 dark:to-gray-600 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Alerte créée
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(alert.createdAt).toLocaleString("fr-FR")}
                  </p>
                  {alert.triggeredBy && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
=======
        <div className="mt-8 rounded-xl backdrop-blur-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">Chronologie</h3>

            <div className="space-y-4">
              {/* Created */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  {(alert.acknowledgedAt || alert.resolvedAt) && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-red-500/50 to-transparent mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-white">Alerte créée</p>
                  <p className="text-sm text-gray-400">
                    {new Date(alert.createdAt).toLocaleString("fr-FR")}
                  </p>
                  {alert.triggeredBy && (
                    <p className="text-sm text-gray-500">
>>>>>>> ai-features-backup
                      Par: {alert.triggeredBy.firstName}{" "}
                      {alert.triggeredBy.lastName}
                    </p>
                  )}
                </div>
              </div>
<<<<<<< HEAD
=======

>>>>>>> ai-features-backup
              {/* Acknowledged */}
              {alert.acknowledgedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
<<<<<<< HEAD
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 border-2 border-blue-300 dark:border-blue-500/50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {alert.resolvedAt && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-blue-300 dark:from-blue-500/50 to-gray-300 dark:to-gray-600 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Prise en compte
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(alert.acknowledgedAt).toLocaleString("fr-FR")}
                    </p>
                    {alert.acknowledgedBy && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
=======
                    <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    {alert.resolvedAt && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500/50 to-transparent mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-white">Prise en compte</p>
                    <p className="text-sm text-gray-400">
                      {new Date(alert.acknowledgedAt).toLocaleString("fr-FR")}
                    </p>
                    {alert.acknowledgedBy && (
                      <p className="text-sm text-gray-500">
>>>>>>> ai-features-backup
                        Par: Dr. {alert.acknowledgedBy.firstName}{" "}
                        {alert.acknowledgedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              )}
<<<<<<< HEAD
              {/* Resolved */}
              {alert.resolvedAt && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 border-2 border-green-300 dark:border-green-500/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Résolu
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(alert.resolvedAt).toLocaleString("fr-FR")}
                    </p>
                    {alert.resolvedBy && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
=======

              {/* Resolved */}
              {alert.resolvedAt && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Résolu</p>
                    <p className="text-sm text-gray-400">
                      {new Date(alert.resolvedAt).toLocaleString("fr-FR")}
                    </p>
                    {alert.resolvedBy && (
                      <p className="text-sm text-gray-500">
>>>>>>> ai-features-backup
                        Par: Dr. {alert.resolvedBy.firstName}{" "}
                        {alert.resolvedBy.lastName}
                      </p>
                    )}
                    {alert.resolution && (
<<<<<<< HEAD
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded text-green-700 dark:text-green-300 text-sm">
=======
                      <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
>>>>>>> ai-features-backup
                        {alert.resolution}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Alert Response Panel */}
        <AlertResponsePanel
          alertId={alert.id}
          alertStatus={alert.status}
          userId={user.id}
        />
=======
        {/* Action Form */}
        {alert.status !== "RESOLVED" && (
          <div className="mt-8 rounded-xl backdrop-blur-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Actions sur l'alerte
              </h3>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  const action = formData.get("action");

                  if (action === "acknowledge") {
                    await acknowledgeAlert(alert.id, user.id);
                    redirect(`/dashboard/doctor/alerts/${alert.id}`);
                  } else if (action === "resolve") {
                    const notes = formData.get("notes") as string;
                    await resolveAlert(alert.id, user.id, notes);
                    redirect("/dashboard/doctor/alerts");
                  }
                }}
                className="space-y-4"
              >
                {alert.status === "OPEN" && (
                  <button
                    type="submit"
                    name="action"
                    value="acknowledge"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Clock className="w-5 h-5" />
                    Prendre en charge cette alerte
                  </button>
                )}

                {(alert.status === "OPEN" ||
                  alert.status === "ACKNOWLEDGED") && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Notes de résolution
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Décrivez les actions entreprises et la résolution..."
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      name="action"
                      value="resolve"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Marquer comme résolu
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
>>>>>>> ai-features-backup
      </div>
    </div>
  );
}
