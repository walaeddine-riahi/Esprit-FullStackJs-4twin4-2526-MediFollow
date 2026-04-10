"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "DOCTOR",
    status: "active",
  });

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        {
          id: "1",
          name: "Dr. Martin Leclerc",
          email: "martin@example.com",
          role: "DOCTOR",
          status: "active",
          lastLogin: "2024-01-16",
        },
        {
          id: "2",
          name: "Marie Dupont",
          email: "marie@example.com",
          role: "PATIENT",
          status: "active",
          lastLogin: "2024-01-15",
        },
        {
          id: "3",
          name: "Admin User",
          email: "admin@example.com",
          role: "ADMIN",
          status: "active",
          lastLogin: "2024-01-16",
        },
        {
          id: "4",
          name: "Dr. Anne Rousseau",
          email: "anne@example.com",
          role: "DOCTOR",
          status: "inactive",
          lastLogin: "2024-01-10",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let result = users;

    if (search) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFiltered(result);
  }, [search, roleFilter, users]);

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", role: "DOCTOR", status: "active" });
    setShowModal(true);
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...formData } : u))
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...formData,
          lastLogin: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-400/30 border-t-green-400"></div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrateur",
    DOCTOR: "Docteur",
    PATIENT: "Patient",
    AUDITOR: "Auditeur",
  };

  const roleColors: Record<string, { bg: string; text: string; icon: any }> = {
    ADMIN: {
      bg: "dark:bg-red-500/10 bg-red-50",
      text: "dark:text-red-400 text-red-700",
      icon: Shield,
    },
    DOCTOR: {
      bg: "dark:bg-cyan-400/10 bg-cyan-50",
      text: "dark:text-cyan-400 text-cyan-700",
      icon: User,
    },
    PATIENT: {
      bg: "dark:bg-blue-500/10 bg-blue-50",
      text: "dark:text-blue-400 text-blue-700",
      icon: Users,
    },
    AUDITOR: {
      bg: "dark:bg-green-400/10 bg-green-50",
      text: "dark:text-green-400 text-green-700",
      icon: Eye,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {filtered.length} utilisateur(s) trouvé(s) • Total: {users.length}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 text-white dark:text-slate-900 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus size={20} />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            />
          </div>
        </div>

        {/* Role Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Tous", icon: Users },
            { value: "ADMIN", label: "Admin", icon: Shield },
            { value: "DOCTOR", label: "Docteurs", icon: User },
            { value: "PATIENT", label: "Patients", icon: Users },
          ].map((role) => {
            const isActive = roleFilter === role.value;
            return (
              <button
                key={role.value}
                onClick={() => setRoleFilter(role.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? "bg-green-500 dark:bg-green-400 text-white dark:text-slate-900 shadow-lg"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                <role.icon size={16} />
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/50">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                Utilisateur
              </th>
              <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                Rôle
              </th>
              <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                Statut
              </th>
              <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                Dernière Connexion
              </th>
              <th className="text-right py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, index) => {
              const roleColor = roleColors[user.role] || roleColors.PATIENT;
              const RoleIcon = roleColor.icon;
              return (
                <tr
                  key={user.id}
                  className={`border-b border-slate-200 dark:border-slate-700 transition-all duration-200 ${
                    index % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/20"
                  } hover:bg-slate-100 dark:hover:bg-slate-800/50`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${roleColor.bg} ${roleColor.text}`}
                      >
                        {user.name.charAt(0)}
                        {user.name.split(" ")[1]?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {user.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleColor.bg} ${roleColor.text}`}
                    >
                      <RoleIcon size={16} />
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === "active"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-900 dark:text-green-400"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-slate-400"}`}
                      ></span>
                      {user.status === "active" ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="text-center py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(user.lastLogin).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="text-right py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/admin/users/${user.id}`}>
                        <button
                          aria-label="View user details"
                          className="p-2 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Eye size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleEdit(user)}
                        aria-label="Edit user"
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        aria-label="Delete user"
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Users
              size={48}
              className="text-slate-400 dark:text-slate-600 mb-4"
            />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Aucun utilisateur trouvé
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? "Modifier" : "Créer"} un Utilisateur
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  aria-label="Nom"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  aria-label="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Rôle
                </label>
                <select
                  aria-label="Rôle"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                >
                  <option value="ADMIN">👑 Administrateur</option>
                  <option value="DOCTOR">👨‍⚕️ Docteur</option>
                  <option value="PATIENT">👤 Patient</option>
                  <option value="AUDITOR">🔍 Auditeur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Statut
                </label>
                <select
                  aria-label="Statut"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                >
                  <option value="active">✅ Actif</option>
                  <option value="inactive">⏸️ Inactif</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 text-white dark:text-slate-900 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingId ? "Mettre à jour" : "Créer"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-semibold transition-all duration-200"
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
