import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllAlerts } from "@/lib/actions/alert.actions";
import { Badge } from "@/components/ui/badge";

export default async function DoctorAlertsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const { alerts } = await getAllAlerts();

  const openAlerts = alerts?.filter((a) => a.status === "OPEN") || [];
  const acknowledgedAlerts =
    alerts?.filter((a) => a.status === "ACKNOWLEDGED") || [];
  const resolvedAlerts = alerts?.filter((a) => a.status === "RESOLVED") || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        );
      case "HIGH":
        return (
          <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        );
      case "MEDIUM":
        return (
          <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
        );
      default:
        return (
          <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };

  const AlertCard = ({ alert }: { alert: any }) => {
    const patientName = `${alert.patient.user.firstName} ${alert.patient.user.lastName}`;

    return (
      <div
        className={`bg-white dark:bg-gray-900 border rounded-lg p-5 hover:shadow-md transition-shadow ${
          alert.severity === "CRITICAL"
            ? "border-red-300 dark:border-red-800"
            : "border-gray-200 dark:border-gray-800"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {alert.message}
              </h3>
              <Link
                href={`/dashboard/doctor/patients/${alert.patientId}`}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                {patientName} - MRN: {alert.patient.medicalRecordNumber}
              </Link>
            </div>
          </div>
          <Badge className={getSeverityColor(alert.severity)}>
            {alert.severity}
          </Badge>
        </div>

        {/* Alert Details */}
        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Type:</span> {alert.alertType}
          </div>

          {alert.vitalValue !== null && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Valeur:</span> {alert.vitalValue}
              {alert.thresholdValue && ` (Seuil: ${alert.thresholdValue})`}
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(alert.createdAt).toLocaleString("fr-FR")}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
          <div className="flex items-center gap-2">
            {alert.status === "RESOLVED" ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Résolu
                </span>
              </>
            ) : alert.status === "ACKNOWLEDGED" ? (
              <>
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  En cours
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Nouveau
                </span>
              </>
            )}
          </div>

          {alert.status !== "RESOLVED" && (
            <Link
              href={`/dashboard/doctor/alerts/${alert.id}`}
              className="text-sm text-blue-600 dark:text-green-400 hover:underline font-medium"
            >
              Gérer →
            </Link>
          )}
        </div>

        {/* Resolution Notes */}
        {alert.resolution && (
          <div className="mt-3 pt-3 border-t dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Notes:</span> {alert.resolution}
            </p>
            {alert.resolvedBy && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Résolu par Dr. {alert.resolvedBy.firstName}{" "}
                {alert.resolvedBy.lastName}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Alertes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez les alertes de vos patients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 dark:bg-gray-900 border border-red-200 dark:border-gray-800 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                Nouvelles
              </p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                {openAlerts.length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-gray-800 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                En cours
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {acknowledgedAlerts.length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-gray-900 border border-green-200 dark:border-gray-800 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                Résolues
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {resolvedAlerts.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-6">
            <button className="border-b-2 border-blue-600 dark:border-green-400 py-3 px-1 text-sm font-medium text-blue-600 dark:text-green-400">
              Nouvelles ({openAlerts.length})
            </button>
            <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:hover:border-gray-600">
              En cours ({acknowledgedAlerts.length})
            </button>
            <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:hover:border-gray-600">
              Résolues ({resolvedAlerts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {openAlerts.length > 0 ? (
          openAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Aucune nouvelle alerte
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Tous vos patients sont stables
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
