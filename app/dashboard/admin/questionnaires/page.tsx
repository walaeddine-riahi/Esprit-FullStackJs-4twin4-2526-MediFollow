"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setQuestionnaires([
        {
          id: "1",
          title: "Évaluation de la Santé Cardiaque",
          description:
            "Questionnaire pour les patients atteints de maladies cardiaques",
          questions: 12,
          createdAt: "2024-01-10",
          responses: 45,
        },
        {
          id: "2",
          title: "Suivi du Diabète",
          description: "Évaluation mensuelle du contrôle du glucose",
          questions: 8,
          createdAt: "2024-01-05",
          responses: 32,
        },
        {
          id: "3",
          title: "Historique Médical Initial",
          description: "Formulaire d'intake pour les nouveaux patients",
          questions: 25,
          createdAt: "2023-12-20",
          responses: 156,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", questions: 0 });
    setShowModal(true);
  };

  const handleEdit = (questionnaire: any) => {
    setEditingId(questionnaire.id);
    setFormData({
      title: questionnaire.title,
      description: questionnaire.description,
      questions: questionnaire.questions,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingId) {
      setQuestionnaires((prev) =>
        prev.map((q) => (q.id === editingId ? { ...q, ...formData } : q))
      );
    } else {
      setQuestionnaires((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString().split("T")[0],
          responses: 0,
        },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce questionnaire?")) {
      setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            Chargement des questionnaires...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Questionnaires
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {questionnaires.length} questionnaire
            {questionnaires.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-slate-900 font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 group"
        >
          <Plus
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
          Nouveau Questionnaire
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-green-400/20 bg-gradient-to-br from-green-50 dark:from-green-400/5 to-slate-50 dark:to-slate-900/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total de Questionnaires
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {questionnaires.length}
              </p>
            </div>
            <HelpCircle className="w-8 h-8 text-green-400 opacity-60" />
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-slate-200 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 dark:from-blue-500/5 to-slate-50 dark:to-slate-900/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Questions Totales
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {questionnaires.reduce((sum, q) => sum + q.questions, 0)}
              </p>
            </div>
            <HelpCircle className="w-8 h-8 text-blue-500 opacity-60" />
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-gradient-to-br from-cyan-50 dark:from-cyan-500/5 to-slate-50 dark:to-slate-900/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Réponses Collectées
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {questionnaires.reduce((sum, q) => sum + q.responses, 0)}
              </p>
            </div>
            <HelpCircle className="w-8 h-8 text-cyan-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Questionnaires Grid */}
      {questionnaires.length === 0 ? (
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <HelpCircle className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4 opacity-50" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Aucun questionnaire pour le moment
          </p>
          <p className="text-slate-500 dark:text-slate-500 mt-2">
            Créez votre premier questionnaire pour commencer
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionnaires.map((questionnaire) => (
            <div
              key={questionnaire.id}
              className="group glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-green-400 dark:hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/10 dark:hover:shadow-green-400/5 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-400/20 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {questionnaire.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {questionnaire.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Questions
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {questionnaire.questions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Réponses
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {questionnaire.responses}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-500">
                  📅 Créé le{" "}
                  {new Date(questionnaire.createdAt).toLocaleDateString(
                    "fr-FR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
                    aria-label="Voir le questionnaire"
                    title="Voir le questionnaire"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">Voir</span>
                  </button>
                  <button
                    onClick={() => handleEdit(questionnaire)}
                    aria-label="Modifier le questionnaire"
                    title="Modifier le questionnaire"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 rounded-lg transition-colors font-medium"
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(questionnaire.id)}
                    aria-label="Supprimer le questionnaire"
                    title="Supprimer le questionnaire"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? "✏️ Modifier" : "➕ Créer"} un Questionnaire
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Titre du questionnaire
                </label>
                <input
                  type="text"
                  placeholder="Ex: Évaluation Cardiaque"
                  aria-label="Titre du questionnaire"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-400 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Décrivez l'objectif de ce questionnaire"
                  aria-label="Description du questionnaire"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-400 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Nombre de questions
                </label>
                <input
                  type="number"
                  placeholder="ex: 12"
                  aria-label="Nombre de questions"
                  min="1"
                  value={formData.questions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questions: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-400 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-slate-900 font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
