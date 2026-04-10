"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Simulated data
  const user = {
    id: params.id,
    name: "Dr. Martin Leclerc",
    email: "martin@example.com",
    role: "DOCTOR",
    status: "active",
    lastLogin: "2024-01-16",
    createdAt: "2023-06-15",
    specialty: "Cardiologie",
    department: "Cardiologie",
    phone: "+33 6 12 34 56 78",
  };

  const recentActivity = [
    "Consultation patient 15/01/2024",
    "Modification de prescription 14/01/2024",
    "Validation de rapport 13/01/2024",
    "Appel patient 12/01/2024",
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <ArrowLeft size={20} />
        Retour
      </button>

      {/* Header */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {user.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {user.role === "DOCTOR" ? "Docteur" : "Utilisateur"} •{" "}
              {user.specialty}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-lg font-semibold ${
              user.status === "active"
                ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                : "bg-gray-100 dark:bg-gray-900/30 text-gray-900 dark:text-gray-100"
            }`}
          >
            {user.status === "active" ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Informations de Contact
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Email
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Téléphone
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {user.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Département
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {user.department}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Informations du Compte
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Rôle</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {user.role === "DOCTOR" ? "Docteur" : user.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Créé</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Dernière Connexion
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {new Date(user.lastLogin).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Activité Récente
        </h3>
        <div className="space-y-2">
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
              <p className="text-slate-900 dark:text-slate-100">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href={`/dashboard/admin/users/${user.id}/edit`}>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            Modifier
          </button>
        </Link>
        <button className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-semibold transition-colors">
          Supprimer
        </button>
      </div>
    </div>
  );
}
