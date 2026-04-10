"use client";

import { useState } from "react";
import {
  Download,
  FileJson,
  FileText,
  MoreVertical,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const dataOptions = [
    {
      id: "alerts",
      label: "Alertes",
      description: "Toutes les alertes du système",
      count: "2,847",
    },
    {
      id: "users",
      label: "Utilisateurs",
      description: "Liste des utilisateurs inscrits",
      count: "156",
    },
    {
      id: "patients",
      label: "Patients",
      description: "Dossiers patients complets",
      count: "144",
    },
    {
      id: "doctors",
      label: "Docteurs",
      description: "Informations des docteurs",
      count: "12",
    },
    {
      id: "appointments",
      label: "Rendez-vous",
      description: "Historique des rendez-vous",
      count: "534",
    },
    {
      id: "vitals",
      label: "Signes Vitaux",
      description: "Données de signes vitaux patients",
      count: "8,234",
    },
    {
      id: "documents",
      label: "Documents",
      description: "Documents médicaux archivés",
      count: "1,203",
    },
  ];

  const toggleDataSelection = (id: string) => {
    setSelectedData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      alert("Sélectionnez au moins une catégorie de données");
      return;
    }

    setExporting(true);
    try {
      // Simulated export
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const data = {
        exportDate: new Date().toISOString(),
        format: selectedFormat,
        dataTypes: selectedData,
        recordCount: Math.floor(Math.random() * 10000) + 1000,
      };

      // Create and download file
      const content =
        selectedFormat === "csv"
          ? Object.entries(data)
              .map(([key, value]) => `${key},${value}`)
              .join("\n")
          : JSON.stringify(data, null, 2);

      const filename = `export_${new Date().getTime()}.${selectedFormat === "csv" ? "csv" : "json"}`;
      const blob = new Blob([content], {
        type: selectedFormat === "csv" ? "text/csv" : "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("✅ Export réussi!");
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          📥 Export de Données
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Exportez les données du système dans votre format préféré (CSV, JSON)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Format Selection */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            📋 Format d'Export
          </h2>
          <div className="space-y-3">
            {[
              {
                id: "csv",
                label: "CSV",
                icon: FileText,
                desc: "Format tabulaire",
              },
              {
                id: "json",
                label: "JSON",
                icon: FileJson,
                desc: "Format structuré",
              },
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setSelectedFormat(id)}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedFormat === id
                    ? "border-green-400 bg-gradient-to-br from-green-50 dark:from-green-400/10 to-green-50/50 dark:to-slate-900/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-green-400/50 dark:hover:border-green-400/30 bg-white dark:bg-slate-900/20"
                }`}
              >
                <Icon
                  size={20}
                  className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0"
                />
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {label}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {desc}
                  </p>
                </div>
                {selectedFormat === id && (
                  <CheckCircle2
                    size={18}
                    className="text-green-600 dark:text-green-400 ml-auto flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data Selection */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            ✅ Sélectionnez les Données
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {selectedData.length} catégorie(s) sélectionnée(s)
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {dataOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-500/5 cursor-pointer transition-all duration-300 group"
              >
                <input
                  type="checkbox"
                  checked={selectedData.includes(option.id)}
                  onChange={() => toggleDataSelection(option.id)}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-green-400 focus:ring-2 focus:ring-green-400 dark:focus:ring-green-400 mt-0.5 cursor-pointer accent-green-400"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {option.label}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {option.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-mono">
                    📊 {option.count} enregistrement(s)
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            disabled={exporting || selectedData.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-slate-400 disabled:to-slate-500 text-slate-900 disabled:text-slate-600 font-bold rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-400/20 group"
          >
            {exporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Exporter
              </>
            )}
          </button>
          <button
            onClick={() => {
              setSelectedData([]);
              setSelectedFormat("csv");
            }}
            className="px-6 py-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-lg transition-colors"
          >
            🔄 Réinitialiser
          </button>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            📌 Résumé:{" "}
            <span className="font-bold text-green-600 dark:text-green-400">
              {selectedData.length}
            </span>{" "}
            catégorie(s) • Format:{" "}
            <span className="font-bold">{selectedFormat.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Recent Exports */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          ⏱️ Exports Récents
        </h2>
        <div className="space-y-3">
          {[
            {
              name: "export_alerts_complete.csv",
              size: "23.5",
              date: "Aujourd'hui",
            },
            {
              name: "export_users_backup.json",
              size: "15.2",
              date: "Hier",
            },
            {
              name: "export_vitals_monthly.csv",
              size: "87.3",
              date: "2 jours ago",
            },
          ].map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-green-400/40 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 flex-1">
                {file.name.endsWith(".json") ? (
                  <FileJson className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-green-500" />
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {file.size}MB • {file.date}
                  </p>
                </div>
              </div>
              <button
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Plus d'options"
                title="Télécharger à nouveau"
              >
                <Download
                  size={18}
                  className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
