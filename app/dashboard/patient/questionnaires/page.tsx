"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPatientQuestionnaireAssignments } from "@/lib/actions/questionnaire.actions";
import QuestionnaireAnswerForm from "@/components/QuestionnaireAnswerForm";

export default function PatientQuestionnairesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  async function loadQuestionnaires() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      const patientId = currentUser.patient?.id;
      if (!patientId) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const qResult = await getPatientQuestionnaireAssignments(patientId);
      if (qResult.success) {
        setAssignments(qResult.assignments || []);
      }
    } catch (error) {
      console.error("Failed to load questionnaires:", error);
    } finally {
      setLoading(false);
    }
  }

  const onComplete = async () => {
    setInfoMessage("Merci ! Questionnaire envoyé au médecin.");
    setSelectedAssignment(null);
    await loadQuestionnaires();
    setTimeout(() => setInfoMessage(""), 3000);
  };

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
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questionnaires</h1>
            <p className="text-sm text-gray-600 mt-1">
              Répondez aux questionnaires envoyés par votre médecin.
            </p>
          </div>
        </div>

        {infoMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{infoMessage}</div>
        )}

        {selectedAssignment ? (
          <div className="mb-6">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              &larr; Retour à la liste des questionnaires
            </button>
            <QuestionnaireAnswerForm
              assignment={selectedAssignment}
              onComplete={onComplete}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.length === 0 && (
              <p className="text-sm text-gray-600">Aucun questionnaire assigné.</p>
            )}

            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-lg border border-gray-200 p-4 bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.questionnaire?.title || "Questionnaire"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Date limite : {new Date(assignment.dueDate).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Statut : {assignment.status || "PENDING"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.status === "COMPLETED" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Complété
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Répondre
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {assignment.questionnaire?.description || "Aucune description"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
