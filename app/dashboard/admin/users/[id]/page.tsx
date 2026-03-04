"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  UserCog,
  Activity,
  Shield,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getUserById, deleteUser } from "@/lib/actions/admin.actions";

// Update the User interface to match your database structure (without specialization)
interface User {
  id: string;
  email: string;
  name: string; // We'll combine firstName and lastName
  firstName: string;
  lastName: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  status: "ACTIVE" | "INACTIVE" | "PENDING"; // We'll map from isActive
  isActive: boolean;
  createdAt: string | Date;
  phone?: string | null; // Map from phoneNumber
  phoneNumber?: string | null;
  lastActive?: string | Date | null;
  lastLogin?: Date | null;
  passwordHash?: string;
  updatedAt?: Date;
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
          role: userData.role,
          status: userData.isActive ? "ACTIVE" : "INACTIVE",
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          phone: userData.phoneNumber,
          phoneNumber: userData.phoneNumber,
          lastActive: userData.lastLogin,
          lastLogin: userData.lastLogin,
          updatedAt: userData.updatedAt,
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
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
        return <Users size={20} />;
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

  function getStatusColor(status: string) {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "INACTIVE":
        return "text-gray-600 bg-gray-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
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
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin/users"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Détails de l'utilisateur
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

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* User Profile Card */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-3xl font-semibold text-gray-600">
                  {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name || "Non renseigné"}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/users/${user.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Modifier
                </Link>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informations</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium text-gray-900">
                        {getRoleLabel(user.role)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Clock size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.isActive ? <CheckCircle size={14} className="mr-1 text-green-600" /> : <XCircle size={14} className="mr-1 text-gray-600" />}
                        {getStatusLabel(user.status)}
                      </span>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Phone size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Activité</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Calendar size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date d'inscription</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {user.lastActive && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Clock size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dernière activité</p>
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">ID Utilisateur</p>
                  <p className="font-mono text-gray-900">{user.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dernière mise à jour</p>
                  <p className="text-gray-900">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "Non disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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