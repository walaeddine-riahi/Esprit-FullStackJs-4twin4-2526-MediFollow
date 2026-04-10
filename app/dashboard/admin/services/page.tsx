"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Save,
  Trash2,
  Users,
  Stethoscope,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  createService,
  deleteService,
  getAllServices,
  getAssignableCareTeam,
  getAssignablePatients,
  updateService,
} from "@/lib/actions/service.actions";

type Service = {
  id: string;
  serviceName: string;
  description: string | null;
  consultationFee: number | null;
  averageDuration: number | null;
  isActive: boolean;
  specializations: string[];
  patientIds: string[];
  teamIds: string[];
};

type OptionItem = {
  id: string;
  label: string;
  email: string;
  role?: string;
};

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<OptionItem[]>([]);
  const [team, setTeam] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Selected existing service
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // New service form
  const [newServicePatientIds, setNewServicePatientIds] = useState<string[]>(
    []
  );
  const [newServiceTeamIds, setNewServiceTeamIds] = useState<string[]>([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    description: "",
    consultationFee: "",
    averageDuration: "",
    specializations: "",
  });

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || null;

  async function loadData() {
    setLoading(true);
    const [servicesRes, patientsRes, teamRes] = await Promise.all([
      getAllServices(),
      getAssignablePatients(),
      getAssignableCareTeam(),
    ]);

    if (servicesRes.success) {
      const list = servicesRes.services as Service[];
      setServices(list);
      if (!selectedServiceId && list.length > 0) {
        setSelectedServiceId(list[0].id);
        setSelectedPatientIds(list[0].patientIds || []);
        setSelectedTeamIds(list[0].teamIds || []);
      }
    }

    if (patientsRes.success) setPatients(patientsRes.patients as OptionItem[]);
    if (teamRes.success) setTeam(teamRes.team as OptionItem[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  // When selecting a different service, load its assignments from the service object
  function handleSelectService(serviceId: string) {
    setSelectedServiceId(serviceId);
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      setSelectedPatientIds(svc.patientIds || []);
      setSelectedTeamIds(svc.teamIds || []);
    }
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    if (!newService.serviceName.trim()) return;

    const result = await createService({
      serviceName: newService.serviceName.trim(),
      description: newService.description.trim() || undefined,
      consultationFee: newService.consultationFee
        ? Number(newService.consultationFee)
        : null,
      averageDuration: newService.averageDuration
        ? Number(newService.averageDuration)
        : null,
      specializations: newService.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      patientIds: newServicePatientIds,
      teamIds: newServiceTeamIds,
    });

    if (result.success) {
      setNewService({
        serviceName: "",
        description: "",
        consultationFee: "",
        averageDuration: "",
        specializations: "",
      });
      setNewServicePatientIds([]);
      setNewServiceTeamIds([]);
      await loadData();
      if (result.service?.id) handleSelectService(result.service.id);
    } else {
      alert(`Failed to create service: ${result.error || ""}`);
    }
  }

  async function handleToggleActive(service: Service) {
    await updateService(service.id, { isActive: !service.isActive });
    await loadData();
  }

  async function handleDeleteService(serviceId: string) {
    await deleteService(serviceId);
    if (selectedServiceId === serviceId) {
      setSelectedServiceId("");
      setSelectedPatientIds([]);
      setSelectedTeamIds([]);
    }
    await loadData();
  }

  async function handleSaveAssignments() {
    if (!selectedServiceId) return;
    setSaving(true);
    await updateService(selectedServiceId, {
      patientIds: selectedPatientIds,
      teamIds: selectedTeamIds,
    });
    await loadData();
    setSaving(false);
  }

  function toggle(
    id: string,
    current: string[],
    setter: (ids: string[]) => void
  ) {
    setter(
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  }

  async function handleAIAutoAssign() {
    setAiRunning(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai-assign", { method: "POST" });
      const data = await res.json();
      if (data.success && data.assignments) {
        const totalAssigned = data.assignments.reduce(
          (sum: number, a: any) => sum + a.patientUserIds.length,
          0
        );
        setAiResult({
          success: true,
          message: `✅ AI a assigné ${totalAssigned} patient(s) parmi ${data.assignments.length} service(s).`,
        });
        await loadData();
      } else {
        setAiResult({
          success: false,
          message: data.error || "Échec de l'assignation IA.",
        });
      }
    } catch {
      setAiResult({
        success: false,
        message: "Erreur réseau. Veuillez réessayer.",
      });
    } finally {
      setAiRunning(false);
      setTimeout(() => setAiResult(null), 8000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            Chargement des services...
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
            🏥 Gestion des Services
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Créez et assignez les services aux patients et équipes de soins
          </p>
        </div>
        <button
          onClick={handleAIAutoAssign}
          disabled={aiRunning}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 px-6 py-3 text-white font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {aiRunning ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              IA en cours...
            </>
          ) : (
            <>
              <Sparkles
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Auto-Assign IA
            </>
          )}
        </button>
      </div>

      {/* AI Result Banner */}
      {aiResult && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
            aiResult.success
              ? "border-green-400/50 dark:border-green-400/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-red-400/50 dark:border-red-400/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {aiResult.success ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {aiResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create Service Form */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Plus size={20} className="text-green-400" /> Nouveau Service
          </h2>
          <form onSubmit={handleCreateService} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Nom du service
              </label>
              <input
                value={newService.serviceName}
                onChange={(e) =>
                  setNewService((p) => ({ ...p, serviceName: e.target.value }))
                }
                placeholder="Ex: Cardiologie"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Description
              </label>
              <textarea
                value={newService.description}
                onChange={(e) =>
                  setNewService((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Décrivez le service..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Tarif (€)
                </label>
                <input
                  value={newService.consultationFee}
                  onChange={(e) =>
                    setNewService((p) => ({
                      ...p,
                      consultationFee: e.target.value,
                    }))
                  }
                  placeholder="0"
                  type="number"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Durée (min)
                </label>
                <input
                  value={newService.averageDuration}
                  onChange={(e) =>
                    setNewService((p) => ({
                      ...p,
                      averageDuration: e.target.value,
                    }))
                  }
                  placeholder="30"
                  type="number"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Spécialisations
              </label>
              <input
                value={newService.specializations}
                onChange={(e) =>
                  setNewService((p) => ({
                    ...p,
                    specializations: e.target.value,
                  }))
                }
                placeholder="Séparé par des virgules"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>

            {/* Patients box */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                👥 Patients ({newServicePatientIds.length} sélectionné
                {newServicePatientIds.length !== 1 ? "s" : ""})
              </p>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {patients.length === 0 && (
                  <p className="text-xs text-slate-500">Aucun patient.</p>
                )}
                {patients.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={newServicePatientIds.includes(p.id)}
                      onChange={() =>
                        toggle(
                          p.id,
                          newServicePatientIds,
                          setNewServicePatientIds
                        )
                      }
                      className="w-4 h-4 rounded accent-green-400"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Care Team box */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                👨‍⚕️ Équipe ({newServiceTeamIds.length} sélectionné
                {newServiceTeamIds.length !== 1 ? "s" : ""})
              </p>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {team.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Aucun docteur/infirmier.
                  </p>
                )}
                {team.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <span>{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{m.role}</span>
                      <input
                        type="checkbox"
                        checked={newServiceTeamIds.includes(m.id)}
                        onChange={() =>
                          toggle(m.id, newServiceTeamIds, setNewServiceTeamIds)
                        }
                        className="w-4 h-4 rounded accent-green-400"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-slate-900 font-bold py-3 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 group"
            >
              <Plus
                size={18}
                className="inline mr-2 group-hover:scale-110 transition-transform"
              />
              Créer le Service
            </button>
          </form>
        </div>

        {/* Service List */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Building2 size={20} className="text-cyan-400" /> Services (
            {services.length})
          </h2>
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400">
                  Aucun service créé
                </p>
              </div>
            ) : (
              services.map((svc) => (
                <div
                  key={svc.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all duration-300 ${
                    selectedServiceId === svc.id
                      ? "border-green-400 bg-green-50 dark:bg-green-500/10 dark:border-green-400/50"
                      : "border-slate-200 dark:border-slate-700 hover:border-green-400/40 dark:hover:border-green-400/30 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectService(svc.id)}
                    className="text-left flex-1"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {svc.serviceName}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {svc.description || "Pas de description"} •{" "}
                      {(svc.patientIds || []).length} patients •{" "}
                      {(svc.teamIds || []).length} équipe
                    </p>
                  </button>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(svc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        svc.isActive
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {svc.isActive ? "✅ Actif" : "⏸️ Inactif"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteService(svc.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assignment Section */}
      {selectedService && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            📋 Assignations pour &ldquo;{selectedService.serviceName}&rdquo;
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patients box */}
            <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Users size={20} className="text-blue-500" /> Patients (
                {selectedPatientIds.length} assigné
                {selectedPatientIds.length !== 1 ? "s" : ""})
              </h3>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {patients.length === 0 && (
                  <p className="text-slate-600 dark:text-slate-400">
                    Aucun patient dans la base de données.
                  </p>
                )}
                {patients.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:bg-blue-50 dark:hover:bg-blue-500/5 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatientIds.includes(p.id)}
                      onChange={() =>
                        toggle(p.id, selectedPatientIds, setSelectedPatientIds)
                      }
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {p.label}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {p.email}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Care Team box */}
            <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Stethoscope size={20} className="text-cyan-500" /> Docteurs
                &amp; Infirmiers ({selectedTeamIds.length} assigné
                {selectedTeamIds.length !== 1 ? "s" : ""})
              </h3>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {team.length === 0 && (
                  <p className="text-slate-600 dark:text-slate-400">
                    Aucun docteur/infirmier dans la base de données.
                  </p>
                )}
                {team.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:bg-cyan-50 dark:hover:bg-cyan-500/5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedTeamIds.includes(m.id)}
                        onChange={() =>
                          toggle(m.id, selectedTeamIds, setSelectedTeamIds)
                        }
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {m.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-500 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                      {m.role}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveAssignments()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-slate-400 disabled:to-slate-500 px-6 py-3 text-slate-900 disabled:text-slate-600 font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <Save
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              {saving ? "Sauvegarde..." : "Sauvegarder les Assignations"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
