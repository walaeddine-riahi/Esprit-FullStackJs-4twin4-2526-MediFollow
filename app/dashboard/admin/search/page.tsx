"use client";

import { useState } from "react";
import { Search, FileText, User, Pill, Calendar } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      // Simulated search
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockResults = [
        {
          id: "1",
          type: "patient",
          title: "Marie Dupont",
          description: "Patient ID: 12345",
          icon: User,
        },
        {
          id: "2",
          type: "document",
          title: "Rapport Médical - Marie Dupont",
          description: "Créé le 15 janvier 2024",
          icon: FileText,
        },
        {
          id: "3",
          type: "appointment",
          title: "Rendez-vous - Marie Dupont",
          description: "16 janvier 2024 à 14:00",
          icon: Calendar,
        },
        {
          id: "4",
          type: "medication",
          title: "Aspirin 100mg",
          description: "Prescrit à Marie Dupont",
          icon: Pill,
        },
      ];

      setResults(mockResults);
    } finally {
      setSearching(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "patient":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100";
      case "document":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100";
      case "appointment":
        return "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100";
      case "medication":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100";
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-900 dark:text-slate-100";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      patient: "Patient",
      document: "Document",
      appointment: "Rendez-vous",
      medication: "Médicament",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Recherche Globale
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Recherchez patients, documents, rendez-vous et plus
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="glass-panel rounded-xl border-2 border-blue-300 dark:border-blue-700 p-6"
      >
        <div className="flex gap-3">
          <Search
            className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
            size={24}
          />
          <input
            type="text"
            placeholder="Rechercher dans le système..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {searching ? "Recherche..." : "Chercher"}
          </button>
        </div>
      </form>

      {/* Recent Searches */}
      {!query && (
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Recherches Récentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Marie Dupont",
              "Allergie",
              "Diabète",
              "Vaccination",
              "Bilan 2024",
            ].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {results.length} résultat(s) trouvé(s) pour "{query}"
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun résultat trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    className="w-full glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${getTypeColor(result.type)}`}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {result.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {result.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getTypeColor(result.type)}`}
                      >
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-blue-50 dark:bg-blue-900/20">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          💡 Conseils de Recherche
        </h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            • Utilisez le nom du patient pour trouver rapidement son dossier
          </li>
          <li>• Recherchez par condition médicale ou symptôme</li>
          <li>• Entrez un numéro d'ID pour des recherches précises</li>
          <li>
            • Les résultats incluent patients, documents, rendez-vous et
            médicaments
          </li>
        </ul>
      </div>
    </div>
  );
}
