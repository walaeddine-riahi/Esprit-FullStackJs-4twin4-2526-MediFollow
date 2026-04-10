"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Mail, Phone, MapPin, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: session?.user?.email || "",
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    bio: "Administrateur système responsable de la gestion des alertes et des utilisateurs.",
    department: "Administration",
    role: "ADMIN",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Profil mis à jour avec succès!");
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Mon Profil
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* Profile Header */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-end gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {formData.name.charAt(0)}
              </span>
            </div>
            {editing && (
              <button
                aria-label="Change profile picture"
                className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Camera size={18} />
              </button>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formData.name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {formData.role} • {formData.department}
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {editing ? "Annuler" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Informations Personnelles
          </h3>

          {[
            { icon: "👤", label: "Nom", name: "name", type: "text" },
            { icon: "📧", label: "Email", name: "email", type: "email" },
            { icon: "📱", label: "Téléphone", name: "phone", type: "tel" },
            {
              icon: "📍",
              label: "Localisation",
              name: "location",
              type: "text",
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {field.label}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg">{field.icon}</span>
                {editing ? (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.label}
                    aria-label={field.label}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-slate-100">
                    {formData[field.name as keyof typeof formData]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Professional Information */}
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Informations Professionnelles
          </h3>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Département
            </label>
            {editing ? (
              <input
                type="text"
                name="department"
                placeholder="Département"
                aria-label="Département"
                value={formData.department}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-slate-900 dark:text-slate-100">
                {formData.department}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Rôle
            </label>
            {editing ? (
              <select
                name="role"
                aria-label="Rôle"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">Admin</option>
                <option value="AUDITOR">Auditeur</option>
                <option value="DOCTOR">Docteur</option>
              </select>
            ) : (
              <p className="mt-1 text-slate-900 dark:text-slate-100">
                {formData.role}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Bio
            </label>
            {editing ? (
              <textarea
                name="bio"
                placeholder="Bio"
                aria-label="Bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-slate-900 dark:text-slate-100">
                {formData.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editing && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={20} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-semibold transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Activity */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Activité Récente
        </h3>
        <div className="space-y-2">
          {[
            "Connexion le 15 janvier 2024 à 14:30",
            "Modification des paramètres le 14 janvier 2024 à 10:15",
            "Export de données le 13 janvier 2024 à 09:45",
            "Approbation de patient le 12 janvier 2024 à 15:20",
          ].map((activity, i) => (
            <p key={i} className="text-slate-600 dark:text-slate-400">
              • {activity}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
