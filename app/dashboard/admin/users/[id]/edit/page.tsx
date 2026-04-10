"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "Dr. Martin Leclerc",
    email: "martin@example.com",
    phone: "+33 6 12 34 56 78",
    specialty: "Cardiologie",
    department: "Cardiologie",
    role: "DOCTOR",
    status: "active",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Utilisateur mis à jour avec succès!");
      router.push(`/dashboard/admin/users/${params.id}`);
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <ArrowLeft size={20} />
        Retour
      </button>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Modifier l'Utilisateur
      </h1>

      {/* Form */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Nom Complet
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nom Complet"
                aria-label="Nom Complet"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                aria-label="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Téléphone"
                aria-label="Téléphone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Département
              </label>
              <input
                type="text"
                name="department"
                placeholder="Département"
                aria-label="Département"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Spécialité
              </label>
              <input
                type="text"
                name="specialty"
                placeholder="Spécialité"
                aria-label="Spécialité"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Rôle
              </label>
              <select
                name="role"
                aria-label="Rôle"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">Administrateur</option>
                <option value="DOCTOR">Docteur</option>
                <option value="PATIENT">Patient</option>
                <option value="AUDITOR">Auditeur</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Statut
              </label>
              <select
                name="status"
                aria-label="Statut"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
