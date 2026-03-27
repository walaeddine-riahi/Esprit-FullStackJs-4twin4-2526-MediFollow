import { redirect } from "next/navigation";
import { Activity, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPendingVitalRecords } from "@/lib/actions/vital.actions";
import VitalReviewTable from "@/components/VitalReviewTable";

export default async function DoctorAlertsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const { records } = await getPendingVitalRecords();

  const criticalCount = records?.filter((r) => r.status === "CRITIQUE").length || 0;
  const warningCount = records?.filter((r) => r.status === "A_VERIFIER").length || 0;
  const totalPending = records?.length || 0;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Activity className="text-blue-600" size={32} />
          Gestion des Signes Vitaux
        </h1>
        <p className="text-gray-600 mt-1">
          Reviewez les enregistrements de signes vitaux nécessitant votre attention
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total en attente</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalPending}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Critiques</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{criticalCount}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Intervention immédiate requise</p>
        </div>

        <div className="bg-white border-l-4 border-orange-500 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">À vérifier</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{warningCount}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <AlertCircle className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Surveillance recommandée</p>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enregistrements en attente de review
        </h2>
        <VitalReviewTable records={records || []} doctorId={user.id} />
      </div>
    </div>
  );
}
