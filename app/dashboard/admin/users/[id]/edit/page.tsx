"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  UserCog,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getUserById, updateUser, deleteUser } from "@/lib/actions/admin.actions";

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

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "PATIENT" as "ADMIN" | "DOCTOR" | "PATIENT",
    isActive: true,
    phoneNumber: "",
  });

  useEffect(() => {
    checkAuthAndLoadUser();
  }, []);

  async function checkAuthAndLoadUser() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const userData = await getUserById(params.id);
      
      if (userData) {
        // Map database fields to your interface
        const mappedUser: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
          role: userData.role,
          isActive: userData.isActive,
          status: userData.isActive ? "ACTIVE" : "INACTIVE",
          createdAt: userData.createdAt,
          phone: userData.phoneNumber,
          phoneNumber: userData.phoneNumber,
          lastLogin: userData.lastLogin,
        };
        
        setUser(mappedUser);
        
        // Initialize form with user data
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          role: userData.role,
          isActive: userData.isActive,
          phoneNumber: userData.phoneNumber || "",
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const result = await updateUser(params.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        phoneNumber: formData.phoneNumber,
      });
      
      if (result.success) {
        router.push(`/dashboard/admin/users/${params.id}`);
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour de l'utilisateur");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      
      const result = await deleteUser(params.id);
      
      if (result.success) {
        router.push("/dashboard/admin/users");
        router.refresh();
      } else {
        alert("Erreur lors de la suppression de l'utilisateur");
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Une erreur est survenue");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case "ADMIN":
        return <Shield size={20} className="text-purple-600" />;
      case "DOCTOR":
        return <UserCog size={20} className="text-blue-600" />;
      case "PATIENT":
        return <Activity size={20} className="text-green-600" />;
      default:
        return <User size={20} />;
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-2xl text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Utilisateur non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/admin/users/${params.id}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Modifier l'utilisateur
              </h1>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* User Info Card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-semibold text-gray-600">
                {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                  user.role === "DOCTOR" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {getRoleIcon(user.role)}
                  {getRoleLabel(user.role)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {user.isActive ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-gray-600" />}
                  {user.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Informations personnelles
          </h3>

          <div className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Role */}
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

            {/* Status */}
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

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Link
                href={`/dashboard/admin/users/${params.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                <span className="font-medium text-gray-900">{user.name}</span> ?
                <br />
                Cette action est irréversible et toutes les données associées seront perdues.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Suppression..." : "Supprimer définitivement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}