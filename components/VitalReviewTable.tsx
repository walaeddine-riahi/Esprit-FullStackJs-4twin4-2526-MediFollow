"use client";

import { useState } from "react";
import { Activity, Clock, AlertCircle, CheckCircle, MessageSquare, X } from "lucide-react";
import { reviewVitalRecord } from "@/lib/actions/vital.actions";

interface VitalReviewTableProps {
  records: any[];
  doctorId: string;
}

export default function VitalReviewTable({ records, doctorId }: VitalReviewTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [newStatus, setNewStatus] = useState<"NORMAL" | "A_VERIFIER" | "CRITIQUE">("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReview = async () => {
    if (!selectedRecord) {
      setError("Aucun enregistrement sélectionné");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await reviewVitalRecord(selectedRecord.id, doctorId, reviewNotes, newStatus);
      
      if (result.success) {
        setSelectedRecord(null);
        setReviewNotes("");
        setNewStatus("NORMAL");
        // La page sera rechargée automatiquement grâce à revalidatePath
        window.location.reload();
      } else {
        setError(result.error || "Erreur lors du review");
      }
    } catch (err) {
      setError("Erreur lors du review");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "CRITIQUE") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
          🔴 CRITIQUE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200">
        🟡 À VÉRIFIER
      </span>
    );
  };

  const formatVitals = (record: any) => {
    const parts = [];
    if (record.systolicBP && record.diastolicBP) {
      parts.push(`TA: ${record.systolicBP}/${record.diastolicBP}`);
    }
    if (record.heartRate) {
      parts.push(`FC: ${record.heartRate} bpm`);
    }
    if (record.temperature) {
      parts.push(`Temp: ${record.temperature}°C`);
    }
    if (record.oxygenSaturation) {
      parts.push(`SpO2: ${record.oxygenSaturation}%`);
    }
    if (record.weight) {
      parts.push(`Poids: ${record.weight} kg`);
    }
    return parts.join(" | ");
  };

  return (
    <>
      {/* Tableau */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Signes vitaux
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Aucun enregistrement en attente</p>
                  <p className="text-gray-500 text-sm">Tous les signes vitaux ont été reviewés</p>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {record.patient.user.firstName} {record.patient.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        MRN: {record.patient.medicalRecordNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatVitals(record)}
                    </div>
                    {record.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Note: {record.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={14} />
                      {new Date(record.recordedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.recordedAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setReviewNotes("");
                        setNewStatus(record.status); // Initialiser avec le statut actuel
                        setError("");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare size={16} />
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Review */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                Review des signes vitaux
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Patient</h3>
                <p className="text-base font-semibold text-gray-900">
                  {selectedRecord.patient.user.firstName} {selectedRecord.patient.user.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  MRN: {selectedRecord.patient.medicalRecordNumber}
                </p>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Statut actuel</h3>
                {getStatusBadge(selectedRecord.status)}
              </div>

              {/* Nouveau Statut */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Nouveau statut après review *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStatus("NORMAL")}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                      newStatus === "NORMAL"
                        ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">🟢</div>
                    NORMAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("A_VERIFIER")}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                      newStatus === "A_VERIFIER"
                        ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">🟡</div>
                    À VÉRIFIER
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("CRITIQUE")}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                      newStatus === "CRITIQUE"
                        ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">🔴</div>
                    CRITIQUE
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newStatus === "NORMAL" && "Valeurs normales, aucune action requise"}
                  {newStatus === "A_VERIFIER" && "Surveillance recommandée"}
                  {newStatus === "CRITIQUE" && "Intervention immédiate requise"}
                </p>
              </div>

              {/* Vitals */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Signes vitaux</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                  {selectedRecord.systolicBP && selectedRecord.diastolicBP && (
                    <div>
                      <span className="text-gray-600">Tension artérielle:</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedRecord.systolicBP}/{selectedRecord.diastolicBP} mmHg
                      </span>
                    </div>
                  )}
                  {selectedRecord.heartRate && (
                    <div>
                      <span className="text-gray-600">Fréquence cardiaque:</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedRecord.heartRate} bpm
                      </span>
                    </div>
                  )}
                  {selectedRecord.temperature && (
                    <div>
                      <span className="text-gray-600">Température:</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedRecord.temperature} °C
                      </span>
                    </div>
                  )}
                  {selectedRecord.oxygenSaturation && (
                    <div>
                      <span className="text-gray-600">SpO2:</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedRecord.oxygenSaturation} %
                      </span>
                    </div>
                  )}
                  {selectedRecord.weight && (
                    <div>
                      <span className="text-gray-600">Poids:</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedRecord.weight} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes du patient */}
              {selectedRecord.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes du patient</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Commentaire du review <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ajoutez votre commentaire médical ici (optionnel)..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setSelectedRecord(null)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReview}
                disabled={submitting || !reviewNotes.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Valider le review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
