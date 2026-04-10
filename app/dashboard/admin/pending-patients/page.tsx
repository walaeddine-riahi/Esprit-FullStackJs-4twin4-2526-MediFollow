"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, User } from "lucide-react";
import Link from "next/link";

export default function PendingPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Simulated data
    setTimeout(() => {
      setPatients([
        {
          id: "1",
          name: "Marie Dupont",
          email: "marie@example.com",
          registeredAt: "2024-01-15",
          status: "pending",
        },
        {
          id: "2",
          name: "Jean Martin",
          email: "jean@example.com",
          registeredAt: "2024-01-16",
          status: "pending",
        },
        {
          id: "3",
          name: "Sophie Claude",
          email: "sophie@example.com",
          registeredAt: "2024-01-14",
          status: "pending",
        },
        {
          id: "4",
          name: "Pierre Bernard",
          email: "pierre@example.com",
          registeredAt: "2024-01-13",
          status: "rejected",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (patientId: string) => {
    console.log("Approving patient:", patientId);
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: "approved" } : p))
    );
  };

  const handleReject = async (patientId: string) => {
    console.log("Rejecting patient:", patientId);
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: "rejected" } : p))
    );
  };

  const filtered =
    filter === "all" ? patients : patients.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Patients en Attente
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {filtered.length} patient(s) {filter !== "all" ? `(${filter})` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "Tous" },
          { value: "pending", label: "En attente" },
          { value: "approved", label: "Approuvés" },
          { value: "rejected", label: "Rejetés" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Patients List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Aucun patient trouvé
          </div>
        ) : (
          filtered.map((patient) => (
            <div
              key={patient.id}
              className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {patient.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Inscrit le{" "}
                      {new Date(patient.registeredAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      patient.status === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100"
                        : patient.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                          : "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100"
                    }`}
                  >
                    {patient.status === "pending"
                      ? "En attente"
                      : patient.status === "approved"
                        ? "Approuvé"
                        : "Rejeté"}
                  </span>

                  {patient.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(patient.id)}
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Approuver"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleReject(patient.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Rejeter"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="View patient details"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
