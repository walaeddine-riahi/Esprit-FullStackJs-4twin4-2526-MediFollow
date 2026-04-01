"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Plus,
  Trash2,
  Send,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  createQuestionnaireTemplate,
  getQuestionnaireTemplates,
  assignQuestionnaire,
  getPatientQuestionnaireAssignments,
  getDoctorQuestionnaireResponses,
} from "@/lib/actions/questionnaire.actions";
import { getAllPatients } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";

type TabType = "templates" | "assign" | "responses";
type QuestionType = "TEXT" | "TEXTAREA" | "RATING" | "DATE" | "YESNO" | "CHECKBOX" | "MULTISELECT";

interface Question {
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  minValue?: number;
  maxValue?: number;
}

interface PatientAssignment {
  id: string;
  patientId: string;
  patient: {
    firstName?: string;
    lastName?: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  questionnaire: any;
  dueDate: string | Date;
  completedAt?: string | Date | null;
  status: string;
  responses: Array<{
    id: string;
    questionId: string;
    answer: string;
  }>;
}

export default function QuestionnairesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Templates tab state
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateType, setTemplateType] = useState<string>("CUSTOM");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({});
  const [questionError, setQuestionError] = useState("");
  const [templateCreating, setTemplateCreating] = useState(false);

  // Assign tab state
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Responses tab state
  const [assignments, setAssignments] = useState<PatientAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<PatientAssignment | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "DOCTOR") {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Load templates
      const templatesResult = await getQuestionnaireTemplates();
      if (templatesResult.success) {
        setTemplates(templatesResult.questionnaires || []);
      }

      // Load patients
      const patientsData = await getAllPatients();
      setPatients(patientsData || []);

      // Auto-select Jean Martin if present
      const defaultPatient = (patientsData || []).find(
        (p: any) => p?.user?.email === "patient@medifollow.health"
      );
      if (defaultPatient) {
        setSelectedPatient(defaultPatient.id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load page data:", error);
      setLoading(false);
    }
  }

  // Template management functions
  function addQuestion() {
    setQuestionError("");

    if (
      !currentQuestion.title ||
      !currentQuestion.type ||
      currentQuestion.title.trim() === ""
    ) {
      setQuestionError("Veuillez remplir le titre et type de question");
      return;
    }

    if (
      currentQuestion.type === "RATING" &&
      (!currentQuestion.minValue || !currentQuestion.maxValue)
    ) {
      setQuestionError("Veuillez définir min et max pour les notes");
      return;
    }

    if (
      (currentQuestion.type === "CHECKBOX" ||
        currentQuestion.type === "MULTISELECT") &&
      (!currentQuestion.options || currentQuestion.options.length === 0)
    ) {
      setQuestionError("Veuillez ajouter au moins une option");
      return;
    }

    setQuestions([...questions, currentQuestion as Question]);
    setCurrentQuestion({});
    setQuestionError("");
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function createTemplate() {
    setQuestionError("");

    if (!templateTitle.trim() || questions.length === 0) {
      setQuestionError("Veuillez ajouter un titre et au moins une question");
      return;
    }

    if (!user?.id) {
      setQuestionError("Erreur: ID utilisateur manquant");
      return;
    }

    setTemplateCreating(true);

    try {
      const result = await createQuestionnaireTemplate({
        title: templateTitle,
        description: templateDescription,
        type: templateType,
        questions,
        createdBy: user.id,
      });

      if (result.success && result.questionnaire) {
        setTemplates([...templates, result.questionnaire]);
        setTemplateTitle("");
        setTemplateDescription("");
        setTemplateType("CUSTOM");
        setQuestions([]);
        setCurrentQuestion({});
        setShowTemplateForm(false);
        setQuestionError("");
      } else {
        setQuestionError(result.error || "Erreur lors de la création");
      }
    } catch (error: any) {
      setQuestionError(error.message || "Erreur lors de la création");
    } finally {
      setTemplateCreating(false);
    }
  }

  // Assign questionnaire
  async function handleAssign() {
    setAssignError("");
    setAssignSuccess("");

    if (!selectedPatient || !selectedTemplate || !dueDate) {
      setAssignError("Veuillez remplir tous les champs");
      return;
    }

    setAssigning(true);

    try {
      const result = await assignQuestionnaire(
        selectedTemplate,
        selectedPatient,
        new Date(dueDate)
      );

      if (result.success) {
        setAssignSuccess("Questionnaire assigné avec succès!");
        setSelectedPatient("");
        setSelectedTemplate("");
        setDueDate("");

        // Reload templates to update counts
        const templatesResult = await getQuestionnaireTemplates();
        if (templatesResult.success) {
          setTemplates(templatesResult.questionnaires || []);
        }

        setTimeout(() => setAssignSuccess(""), 3000);
      } else {
        setAssignError(result.error || "Erreur lors de l'assignation");
      }
    } catch (error: any) {
      setAssignError(error.message || "Erreur lors de l'assignation");
    } finally {
      setAssigning(false);
    }
  }

  // Load responses for current tab
  useEffect(() => {
    if (activeTab === "responses") {
      loadResponses();
    }
  }, [activeTab]);

  async function loadResponses() {
    try {
      if (!user?.id) return;
      const responsesResult = await getDoctorQuestionnaireResponses(user.id);
      if (responsesResult.success) {
        setAssignments(responsesResult.assignments || []);
      }
    } catch (error) {
      console.error("Failed to load responses:", error);
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border border-green-200";
      case "PENDING":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "OVERDUE":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="size-4" />;
      case "PENDING":
        return <Clock className="size-4" />;
      case "OVERDUE":
        return <AlertCircle className="size-4" />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-12 bg-blue-100 rounded-lg mb-4">
            <ClipboardList className="size-6 text-blue-600" />
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardList className="size-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          </div>
          <p className="text-gray-600">
            Gérez les questionnaires de suivi pour vos patients
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
          {[
            { id: "templates", label: "Modèles" },
            { id: "assign", label: "Assigner" },
            { id: "responses", label: "Réponses" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* TEMPLATES TAB */}
          {activeTab === "templates" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Modèles de questionnaires
                </h2>
                <button
                  onClick={() => setShowTemplateForm(!showTemplateForm)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="size-4" />
                  <span>Nouveau modèle</span>
                </button>
              </div>

              {/* Create Template Form */}
              {showTemplateForm && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Créer un nouveau modèle
                  </h3>

                  {questionError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center space-x-2">
                      <AlertCircle className="size-4" />
                      <span>{questionError}</span>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Titre du modèle"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      placeholder="Description (optionnel)"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                    />
                    <select
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CUSTOM">Personnalisé</option>
                      <option value="POST_OP">Évaluation post-opératoire</option>
                      <option value="SYMPTOM_TRACKING">Suivi des symptômes</option>
                      <option value="WEEKLY_ASSESSMENT">Évaluation hebdomadaire</option>
                      <option value="MEDICATION_ADHERENCE">Observance médicamenteuse</option>
                    </select>
                  </div>

                  {/* Add Question */}
                  <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Ajouter une question
                    </h4>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Titre de la question"
                        value={currentQuestion.title || ""}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />

                      <select
                        value={currentQuestion.type || "TEXT"}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            type: e.target.value as QuestionType,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="TEXT">Texte court</option>
                        <option value="TEXTAREA">Texte long</option>
                        <option value="RATING">Note (0-10)</option>
                        <option value="DATE">Date</option>
                        <option value="YESNO">Oui/Non</option>
                        <option value="CHECKBOX">Cases à cocher</option>
                        <option value="MULTISELECT">Sélection multiple</option>
                      </select>

                      {currentQuestion.type === "RATING" && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min (ex: 0)"
                            value={currentQuestion.minValue || ""}
                            onChange={(e) =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                minValue: parseInt(e.target.value),
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="number"
                            placeholder="Max (ex: 10)"
                            value={currentQuestion.maxValue || ""}
                            onChange={(e) =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                maxValue: parseInt(e.target.value),
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}

                      {(currentQuestion.type === "CHECKBOX" ||
                        currentQuestion.type === "MULTISELECT") && (
                        <input
                          type="text"
                          placeholder="Options (séparées par des virgules)"
                          value={currentQuestion.options?.join(", ") || ""}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              options: e.target.value
                                .split(",")
                                .map((o) => o.trim()),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={currentQuestion.required || false}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              required: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Requis
                        </span>
                      </label>

                      <button
                        onClick={addQuestion}
                        className="w-full px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        Ajouter la question
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {questions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Questions ajoutées ({questions.length})
                      </h4>
                      <div className="space-y-2">
                        {questions.map((q, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {idx + 1}. {q.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                Type: {q.type}{" "}
                                {q.required && "• Requis"}
                              </p>
                            </div>
                            <button
                              onClick={() => removeQuestion(idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={createTemplate}
                      disabled={templateCreating}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      {templateCreating ? "Création..." : "Créer le modèle"}
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateForm(false);
                        setTemplateTitle("");
                        setTemplateDescription("");
                        setTemplateType("CUSTOM");
                        setQuestions([]);
                        setCurrentQuestion({});
                        setQuestionError("");
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {template.title}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {template._count?.questions || 0} question
                        {template._count?.questions !== 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span>
                        {template._count?.assignments || 0} assignation
                        {template._count?.assignments !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardList className="size-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Aucun modèle trouvé. Créez votre premier modèle!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ASSIGN TAB */}
          {activeTab === "assign" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Assigner un questionnaire
              </h2>

              {assignError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="size-5" />
                  <span>{assignError}</span>
                </div>
              )}

              {assignSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="size-5" />
                  <span>{assignSuccess}</span>
                </div>
              )}

              <div className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                          {patient.user
                            ? `${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`
                            : `${patient.firstName} ${patient.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un modèle...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                >
                  <Send className="size-4" />
                  <span>{assigning ? "Assignation..." : "Assigner"}</span>
                </button>
              </div>
            </div>
          )}

          {/* RESPONSES TAB */}
          {activeTab === "responses" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Réponses des patients
              </h2>

              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="size-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    Pas encore de questionnaires complétés.
                  </p>
                  <p className="text-sm text-gray-500">
                    Dès qu'un patient termine un questionnaire, vous le verrez ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Patient</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Questionnaire</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Complété</th>
                          <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {assignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {assignment.patient?.user?.firstName} {assignment.patient?.user?.lastName}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {assignment.questionnaire?.title}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={getStatusBadgeColor(assignment.status)}>
                                {assignment.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {assignment.completedAt
                                ? new Date(assignment.completedAt).toLocaleString("fr-FR")
                                : "-"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setShowResponseModal(true);
                                }}
                                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                              >
                                Voir les réponses
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {showResponseModal && selectedAssignment && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedAssignment.questionnaire?.title} - {selectedAssignment.patient?.user?.firstName} {selectedAssignment.patient?.user?.lastName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Complété le {new Date(selectedAssignment.completedAt || "").toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowResponseModal(false)}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Fermer
                        </button>
                      </div>

                      <div className="space-y-3">
                        {selectedAssignment.questionnaire.questions.map((question: any) => {
                          const response = selectedAssignment.responses.find(
                            (r: any) => r.questionId === question.id
                          );

                          return (
                            <div key={question.id} className="rounded-lg border border-gray-200 bg-white p-3">
                              <p className="text-sm font-semibold text-gray-800">{question.title}</p>
                              <p className="text-sm text-gray-600">{response ? response.answer : "Aucune réponse"}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
