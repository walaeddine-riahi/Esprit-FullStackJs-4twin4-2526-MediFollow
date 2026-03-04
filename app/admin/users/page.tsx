"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  UserCog,
  Activity,
  Shield,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Filter,
  ArrowUpDown,
  Eye,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "@/lib/actions/admin.actions";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  phone?: string;
  specialization?: string;
  lastActive?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  async function checkAuthAndLoadUsers() {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      await loadUsers();
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    }
  }

  async function loadUsers() {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      // Map backend fields to frontend User type
      const mappedUsers: User[] = allUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: (u.firstName || "") + (u.lastName ? " " + u.lastName : ""),
        role: u.role,
        status: u.isActive === true ? "ACTIVE" : "INACTIVE",
        createdAt: typeof u.createdAt === "string" ? u.createdAt : u.createdAt?.toISOString?.() || "",
        phone: u.phoneNumber || "",
        specialization: u.specialization || "",
        lastActive: u.lastLogin ? (typeof u.lastLogin === "string" ? u.lastLogin : u.lastLogin.toISOString?.()) : undefined,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }

  function handleSort(key: keyof User) {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  async function handleUpdateUser(userId: string, userData: Partial<User>) {
    try {
      setActionLoading(true);
      await updateUser(userId, userData);
      await loadUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      setActionLoading(true);
      await deleteUser(userId);
      await loadUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setActionLoading(false);
    }
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "DOCTOR":
        return "bg-blue-100 text-blue-700";
      case "PATIENT":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle size={14} className="text-green-600" />;
      case "INACTIVE":
        return <XCircle size={14} className="text-gray-600" />;
      case "PENDING":
        return <AlertCircle size={14} className="text-yellow-600" />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">
            Chargement des utilisateurs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronRight size={20} className="rotate-180" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Gestion des Utilisateurs
              </h1>
            </div>
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} />
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou téléphone..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filtres:</span>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="DOCTOR">Médecins</option>
              <option value="PATIENT">Patients</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="INACTIVE">Inactifs</option>
              <option value="PENDING">En attente</option>
            </select>

            {(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Utilisateur
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("role")}
                      className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Rôle
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Statut
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Date d'inscription
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Contact
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-600 font-medium">
                        Aucun utilisateur trouvé
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Essayez de modifier vos filtres de recherche
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || "Non renseigné"}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role === "ADMIN" && "Administrateur"}
                          {user.role === "DOCTOR" && "Médecin"}
                          {user.role === "PATIENT" && "Patient"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            user.status
                          )}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status === "ACTIVE" && "Actif"}
                          {user.status === "INACTIVE" && "Inactif"}
                          {user.status === "PENDING" && "En attente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone size={14} />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsViewModalOpen(true);
                            }}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer with stats */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600">
                Total: <span className="font-medium">{users.length}</span> utilisateurs
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-gray-600">
                    Actifs: {users.filter((u) => u.status === "ACTIVE").length}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="text-gray-600">
                    En attente: {users.filter((u) => u.status === "PENDING").length}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                  <span className="text-gray-600">
                    Inactifs: {users.filter((u) => u.status === "INACTIVE").length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
          loading={actionLoading}
        />
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <UserViewModal
          user={selectedUser}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          onEdit={() => {
            setIsViewModalOpen(false);
            setIsEditModalOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <DeleteConfirmationModal
          user={selectedUser}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// Modal Components
function UserFormModal({
  user,
  onClose,
  onSave,
  loading,
}: {
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, data: Partial<User>) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "PATIENT",
    status: user?.status || "ACTIVE",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(user?.id || "new", formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Médecin</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as User["status"] })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="PENDING">En attente</option>
              </select>
            </div>
          </div>

          {formData.role === "DOCTOR" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialisation
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="ex: Cardiologie, Pédiatrie..."
              />
            </div>
          )}

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe temporaire
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "En cours..." : user ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserViewModal({
  user,
  onClose,
  onEdit,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Détails de l'utilisateur
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <Users size={32} className="text-gray-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.name || "Non renseigné"}
                </h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium text-gray-900 capitalize">{user.role.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium text-gray-900 capitalize">{user.status.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-900">{user.phone || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Inscrit le</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {user.specialization && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Spécialisation</p>
                  <p className="font-medium text-gray-900">{user.specialization}</p>
                </div>
              )}
              {user.lastActive && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Dernière activité</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.lastActive).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: User;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={24} className="text-red-600" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Confirmer la suppression
          </h2>

          <p className="text-sm text-gray-600 text-center mb-6">
            Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
            <span className="font-medium text-gray-900">{user.name || user.email}</span> ?
            Cette action est irréversible.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}