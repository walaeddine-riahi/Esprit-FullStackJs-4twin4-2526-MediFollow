"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  ArrowLeft,
  Save,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactorAuth: false,
    autoBackup: true,
    maintenanceMode: false,
    language: "fr",
    timezone: "Europe/Paris",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    // Simuler une sauvegarde
    setTimeout(() => {
      setSaving(false);
      alert("Paramètres sauvegardés avec succès");
    }, 1000);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Paramètres
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notifications push</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="toggle"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Alertes par email</span>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                  className="toggle"
                />
              </label>
            </div>
          </div>

          {/* Sécurité */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield size={20} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Authentification à deux facteurs</span>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                  className="toggle"
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Politique de mot de passe</span>
                <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
                  <option>Standard</option>
                  <option>Strict</option>
                  <option>Très strict</option>
                </select>
              </div>
            </div>
          </div>

          {/* Base de données */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Database size={20} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Base de données</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sauvegarde automatique</span>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="toggle"
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Fréquence des sauvegardes</span>
                <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
                  <option>Toutes les heures</option>
                  <option>Tous les jours</option>
                  <option>Toutes les semaines</option>
                </select>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Settings size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-700">Mode maintenance</span>
                  <p className="text-xs text-gray-500">Les utilisateurs ne pourront pas se connecter</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="toggle"
                />
              </label>
            </div>
          </div>

          {/* Préférences */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <Globe size={20} className="text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Préférences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Langue</span>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Fuseau horaire</span>
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}