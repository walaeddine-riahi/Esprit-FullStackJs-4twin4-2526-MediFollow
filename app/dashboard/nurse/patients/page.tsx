"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  UserPlus,
  Activity,
  AlertCircle,
  Calendar,
  User,
  Link as LinkIcon,
  Trash2,
  Edit,
  ChevronRight,
} from "lucide-react";
import {
  getNursePatients,
  getAllPatientsForNurse,
  assignPatientToDoctor,
  getAllDoctors,
} from "@/lib/actions/nurse.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import loading from "@/app/loading";

export default function NursePatientPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDoctor, setAssignDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentNurseId, setCurrentNurseId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      setError("");

      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error("User not authenticated, redirecting to login");
        setError("Session expirée. Veuillez vous reconnecter pour continuer.");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      setCurrentNurseId(currentUser.id);

      // Fetch all patients and doctors in parallel
      const [patientsResult, doctorsResult] = await Promise.all([
        getAllPatientsForNurse(),
        getAllDoctors(),
      ]);

      if (patientsResult.success && patientsResult.patients) {
        const formattedPatients = patientsResult.patients.map(
          (patient: any) => ({
            id: patient.id,
            name: `${patient.user?.firstName} ${patient.user?.lastName}`,
            medicalRecord: patient.medicalRecordNumber || "N/A",
            lastVitals:
              patient.vitalRecords?.[0]?.recordedAt ||
              new Date(Date.now() - 24 * 60 * 60 * 1000),
            alerts: patient.alerts?.length || 0,
            condition: patient.condition || "Non spécifiée",
            status: (patient.alerts?.length || 0) > 0 ? "warning" : "stable",
            patientData: patient,
          })
        );
        setPatients(formattedPatients);
      } else {
        setError(
          patientsResult.error || "Erreur lors du chargement des patients"
        );
      }

      // Load doctors
      if (doctorsResult.success && doctorsResult.doctors) {
        setDoctors(doctorsResult.doctors);
      } else {
        console.warn("Failed to load doctors:", doctorsResult.error);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.medicalRecord.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignDoctor = async () => {
    if (selectedPatient && assignDoctor && currentNurseId) {
      try {
        const result = await assignPatientToDoctor(
          selectedPatient,
          assignDoctor,
          currentNurseId
        );
        if (result.success) {
          setSuccessMessage(
            result.message || "Patient affecté au médecin avec succès"
          );
          setTimeout(() => setSuccessMessage(""), 4000);
          setShowAssignModal(false);
          setAssignDoctor("");
          setSelectedPatient(null);
          // Reload patients to reflect changes
          await loadPatients();
        } else {
          setError(
            result.error || "Erreur lors de l'affectation du patient au médecin"
          );
          setTimeout(() => setError(""), 4000);
        }
      } catch (err) {
        console.error("Error assigning patient:", err);
        setError("Erreur lors de l'affectation du patient");
        setTimeout(() => setError(""), 4000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="size-8 text-pink-600 dark:text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4">
          <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/30 p-4">
          <Activity className="size-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
          <p className="text-pink-700 dark:text-pink-400 text-sm">
            {successMessage}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mes patients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos patients assignés et consultez leurs données
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors">
          <Plus size={18} />
          Ajouter un patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Chercher par nom ou dossier médical..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="space-y-3">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {patient.name.charAt(0)}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {patient.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.status === "stable"
                            ? "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400"
                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {patient.status === "stable"
                          ? "✓ Stable"
                          : "⚠ À surveiller"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Dossier médical
                        </p>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white mt-1">
                          {patient.medicalRecord}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Condition
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white mt-1">
                          {patient.condition}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Alertes
                        </p>
                        <p
                          className={`font-semibold mt-1 ${
                            patient.alerts > 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-pink-600 dark:text-pink-400"
                          }`}
                        >
                          {patient.alerts > 0
                            ? `${patient.alerts} ⚠️`
                            : "Aucune ✓"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Derniers vitaux
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white mt-1">
                          Il y a{" "}
                          {Math.floor(
                            (Date.now() - patient.lastVitals.getTime()) / 60000
                          )}{" "}
                          min
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedPatient(patient.id);
                      setShowAssignModal(true);
                    }}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Affecter au médecin"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    title="Plus d'options"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Patient Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                  <Activity size={14} />
                  Vitaux
                </button>
                <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">
                  <AlertCircle size={14} />
                  Alertes ({patient.alerts})
                </button>
                <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
                  <Calendar size={14} />
                  Historique
                </button>
                <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors">
                  <User size={14} />
                  Profil
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="size-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun patient trouvé
            </p>
          </div>
        )}
      </div>

      {/* Assign Doctor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Affecter le patient au médecin
            </h2>

            <select
              value={assignDoctor}
              onChange={(e) => setAssignDoctor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all mb-4"
              title="Sélectionner un médecin"
            >
              <option value="">Sélectionner un médecin...</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignDoctor("");
                  setSelectedPatient(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignDoctor}
                disabled={!assignDoctor}
                className="flex-1 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-medium transition-colors"
              >
                Affecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
