"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Hash,
  FileText,
  Users,
  AlertCircle,
  Database,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

interface Block {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: Date;
  transactions: number;
  verified: boolean;
}

export default function AdminBlockchainPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Blockchain
              </h1>
              <p className="text-sm text-gray-600">
                Preuves et vérifications des données
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Status Card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Shield size={24} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Statut de la Blockchain</h2>
                <p className="text-sm text-gray-600">Vérification et intégrité des données</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
              <Clock size={14} />
              En attente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Transactions totales</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Blocs vérifiés</p>
              <p className="text-2xl font-bold text-gray-900">567</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Dernière vérification</p>
              <p className="text-2xl font-bold text-gray-900">Il y a 2min</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Preuves de données</h3>
            <p className="text-sm text-gray-600 mb-3">
              Vérification de l'intégrité des données médicales
            </p>
            <span className="inline-flex items-center text-xs text-green-600">
              <CheckCircle size={12} className="mr-1" />
              100% des données vérifiées
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
              <Users size={20} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Identités numériques</h3>
            <p className="text-sm text-gray-600 mb-3">
              Vérification des identités des utilisateurs
            </p>
            <span className="inline-flex items-center text-xs text-green-600">
              <CheckCircle size={12} className="mr-1" />
              48 identités vérifiées
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Traçabilité des alertes</h3>
            <p className="text-sm text-gray-600 mb-3">
              Historique immuable des alertes
            </p>
            <span className="inline-flex items-center text-xs text-green-600">
              <CheckCircle size={12} className="mr-1" />
              89 alertes tracées
            </span>
          </div>
        </div>

        {/* Recent Blocks */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Derniers blocs</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bloc #{i}</p>
                    <p className="text-xs text-gray-500">
                      <Hash size={12} className="inline mr-1" />
                      0x7d3a...b4f2
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">12 transactions</p>
                  <p className="text-xs text-gray-500">Il y a {i} heure</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}