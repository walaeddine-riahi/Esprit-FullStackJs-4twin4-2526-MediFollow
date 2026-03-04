"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // AJOUTER useSearchParams
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  UserCog,
  Activity,
  Shield,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  UserPlus,
  X,
  Save,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllUsers, createUser } from "@/lib/actions/admin.actions";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  isActive: boolean;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string | Date;
  phoneNumber?: string | null;
  phone?: string | null;
  lastLogin?: Date | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // AJOUTER cette ligne
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // MODIFIER ces lignes pour utiliser les paramètres d'URL
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get("role") || "ALL");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "ALL");
  
  // Form state for new user
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PATIENT" as "ADMIN" | "DOCTOR" | "PATIENT",
    isActive: true,
    phoneNumber: "",
  });

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, []);

  // AJOUTER cet effet pour mettre à jour les filtres quand l'URL change
  useEffect(() => {
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    
    if (role) setRoleFilter(role);
    if (status) setStatusFilter(status);
  }, [searchParams]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  async function checkAuthAndLoadUsers() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
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
      const dbUsers = await getAllUsers();
      
      // Map database fields to your interface
      const mappedUsers: User[] = dbUsers.map((dbUser: any) => ({
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName || "",
        lastName: dbUser.lastName || "",
        name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email,
        role: dbUser.role,
        isActive: dbUser.isActive,
        status: dbUser.isActive ? "ACTIVE" : "INACTIVE",
        createdAt: dbUser.createdAt,
        phone: dbUser.phoneNumber,
        phoneNumber: dbUser.phoneNumber,
        lastLogin: dbUser.lastLogin,
      }));
      
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const result = await createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
        phoneNumber: formData.phoneNumber,
      });
      
      if (result.success) {
        setShowAddModal(false);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "PATIENT",
          isActive: true,
          phoneNumber: "",
        });
        // Reload users
        await loadUsers();
      } else {
        alert("Erreur lors de la création de l'utilisateur");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Une erreur est survenue");
    } finally {
      setSaving(false);
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

    setFilteredUsers(filtered);
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

  function getRoleIcon(role: string) {
    switch (role) {
      case "ADMIN":
        return <Shield size={14} className="text-purple-600" />;
      case "DOCTOR":
        return <UserCog size={14} className="text-blue-600" />;
      case "PATIENT":
        return <Activity size={14} className="text-green-600" />;
      default:
        return <Users size={14} />;
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "ADMIN":
        return "Administrateur";
      case "DOCTOR":
        return "Médecin";
      case "PATIENT":
        return "Patient";
      default:
        return role;
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

  function getStatusLabel(status: string) {
    switch (status) {
      case "ACTIVE":
        return "Actif";
      case "INACTIVE":
        return "Inactif";
      case "PENDING":
        return "En attente";
      default:
        return status;
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
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Utilisateurs inscrits
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
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
          {/* Search Bar */}
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

          {/* Filter Chips */}
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
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Afficher les filtres actifs depuis l'URL */}
          {roleFilter !== "ALL" && (
            <div className="text-sm text-gray-600">
              Filtre actif: <span className="font-medium">{getRoleLabel(roleFilter)}</span>
            </div>
          )}
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-sm text-gray-600">
              {roleFilter !== "ALL" 
                ? `Aucun ${getRoleLabel(roleFilter).toLowerCase()} trouvé` 
                : "Essayez de modifier vos filtres de recherche"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                href={`/dashboard/admin/users/${user.id}`}
                className="group"
              >
                <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.name || "Non renseigné"}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          user.status
                        )}`}
                      >
                        {getStatusIcon(user.status)}
                        {getStatusLabel(user.status)}
                      </span>
                    </div>

                    {/* Phone */}
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    )}

                    {/* Registration Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      Inscrit le{" "}
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/dashboard/admin/users/${user.id}/edit`);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/dashboard/admin/users/${user.id}`);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Administrateurs</p>
                <p className="text-xl font-bold text-purple-600">
                  {users.filter((u) => u.role === "ADMIN").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Médecins</p>
                <p className="text-xl font-bold text-blue-600">
                  {users.filter((u) => u.role === "DOCTOR").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-xl font-bold text-green-600">
                  {users.filter((u) => u.role === "PATIENT").length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Actifs: {users.filter((u) => u.status === "ACTIVE").length}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                Inactifs: {users.filter((u) => u.status === "INACTIVE").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal (identique à votre code existant) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Nouvel utilisateur
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {/* ... reste du formulaire identique ... */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "DOCTOR" | "PATIENT" })}
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
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.isActive === true}
                      onChange={() => setFormData({ ...formData, isActive: true })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Actif</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.isActive === false}
                      onChange={() => setFormData({ ...formData, isActive: false })}
                      className="text-gray-600 focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">Inactif</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {saving ? "Création..." : "Créer l'utilisateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}