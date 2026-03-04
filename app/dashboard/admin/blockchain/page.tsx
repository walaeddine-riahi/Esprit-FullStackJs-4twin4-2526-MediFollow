"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  Key,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function BlockchainAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialization state
  const [initStatus, setInitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [initMessage, setInitMessage] = useState("");

  // Grant access state
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState("");
  const [grantSuccess, setGrantSuccess] = useState("");
  const [doctorAddress, setDoctorAddress] = useState("");
  const [patientId, setPatientId] = useState("");
  const [duration, setDuration] = useState("365");

  // Verify access state
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyDoctorAddress, setVerifyDoctorAddress] = useState("");
  const [verifyPatientId, setVerifyPatientId] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Load user error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleInitialize() {
    setInitStatus("loading");
    setInitMessage("");

    try {
      const response = await fetch("/api/blockchain/initialize", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setInitStatus("success");
        setInitMessage(
          `Blockchain initialisée avec succès! TX: ${data.transactionHash}`
        );
      } else {
        setInitStatus("error");
        setInitMessage(data.error || "Erreur lors de l'initialisation");
      }
    } catch (error) {
      setInitStatus("error");
      setInitMessage("Erreur réseau lors de l'initialisation");
    }
  }

  async function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    setGrantLoading(true);
    setGrantError("");
    setGrantSuccess("");

    try {
      const response = await fetch("/api/blockchain/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorAddress,
          patientId,
          durationDays: parseInt(duration),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGrantSuccess(
          `Accès accordé avec succès! TX: ${data.transactionHash}`
        );
        setDoctorAddress("");
        setPatientId("");
      } else {
        setGrantError(data.error || "Erreur lors de l'octroi d'accès");
      }
    } catch (error) {
      setGrantError("Erreur réseau");
    } finally {
      setGrantLoading(false);
    }
  }

  async function handleVerifyAccess(e: React.FormEvent) {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyResult(null);

    try {
      const response = await fetch(
        `/api/blockchain/verify-access?doctorAddress=${verifyDoctorAddress}&patientId=${verifyPatientId}`
      );

      const data = await response.json();
      setVerifyResult(data);
    } catch (error) {
      setVerifyResult({ error: "Erreur réseau" });
    } finally {
      setVerifyLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="size-8 text-blue-600" />
            Administration Blockchain Aptos
          </h1>
          <p className="text-gray-600 mt-2">
            Gestion du contrôle d&apos;accès décentralisé
          </p>
        </div>

        {/* Blockchain Info */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="size-5 text-blue-600" />
            Configuration Blockchain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Réseau</p>
              <p className="font-semibold text-gray-900">Aptos Testnet</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Adresse du contrat</p>
              <p className="font-mono text-xs text-gray-900 break-all">
                0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
              <p className="text-sm text-gray-500 mb-2">Explorateur</p>
              <a
                href="https://explorer.aptoslabs.com/account/0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1?network=testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Voir sur Aptos Explorer
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Initialize Blockchain */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RefreshCw className="size-5 text-green-600" />
            1. Initialiser le Système
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Initialise le registre de contrôle d&apos;accès sur la blockchain
            Aptos. Cette opération doit être effectuée une seule fois.
          </p>

          {initStatus === "success" && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600" />
              <p className="text-sm text-green-800">{initMessage}</p>
            </div>
          )}

          {initStatus === "error" && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{initMessage}</p>
            </div>
          )}

          <button
            onClick={handleInitialize}
            disabled={initStatus === "loading" || initStatus === "success"}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {initStatus === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initialisation...
              </>
            ) : initStatus === "success" ? (
              <>
                <CheckCircle className="size-4" />
                Initialisé
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Initialiser la Blockchain
              </>
            )}
          </button>
        </div>

        {/* Grant Access */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Key className="size-5 text-blue-600" />
            2. Accorder un Accès Docteur
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Accorde la permission à un docteur d&apos;accéder aux données
            d&apos;un patient spécifique sur la blockchain.
          </p>

          {grantSuccess && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600" />
              <p className="text-sm text-green-800">{grantSuccess}</p>
            </div>
          )}

          {grantError && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{grantError}</p>
            </div>
          )}

          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Blockchain du Docteur
              </label>
              <input
                type="text"
                value={doctorAddress}
                onChange={(e) => setDoctorAddress(e.target.value)}
                placeholder="0x1234567890abcdef..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID du Patient (MongoDB)
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="65abc123def..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="size-4" />
                Durée (en jours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 jour (test)</option>
                <option value="7">7 jours (1 semaine)</option>
                <option value="30">30 jours (1 mois)</option>
                <option value="90">90 jours (3 mois)</option>
                <option value="365">365 jours (1 an)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={grantLoading}
              className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {grantLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Octroi en cours...
                </>
              ) : (
                <>
                  <Key className="size-4" />
                  Accorder l&apos;Accès
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verify Access */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="size-5 text-purple-600" />
            3. Vérifier un Accès
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Vérifie si un docteur a la permission d&apos;accéder aux données
            d&apos;un patient.
          </p>

          <form onSubmit={handleVerifyAccess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Blockchain du Docteur
              </label>
              <input
                type="text"
                value={verifyDoctorAddress}
                onChange={(e) => setVerifyDoctorAddress(e.target.value)}
                placeholder="0x1234567890abcdef..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID du Patient
              </label>
              <input
                type="text"
                value={verifyPatientId}
                onChange={(e) => setVerifyPatientId(e.target.value)}
                placeholder="65abc123def..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={verifyLoading}
              className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Shield className="size-4" />
                  Vérifier l&apos;Accès
                </>
              )}
            </button>
          </form>

          {verifyResult && (
            <div className="mt-4">
              {verifyResult.error ? (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Erreur</p>
                    <p className="text-sm text-red-800">{verifyResult.error}</p>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex items-start gap-3 rounded-lg border p-4 ${
                    verifyResult.hasAccess
                      ? "border-green-200 bg-green-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  {verifyResult.hasAccess ? (
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-orange-600" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        verifyResult.hasAccess
                          ? "text-green-900"
                          : "text-orange-900"
                      }`}
                    >
                      {verifyResult.hasAccess
                        ? "✅ Accès Autorisé"
                        : "❌ Accès Refusé"}
                    </p>
                    <p
                      className={`text-sm ${
                        verifyResult.hasAccess
                          ? "text-green-800"
                          : "text-orange-800"
                      }`}
                    >
                      {verifyResult.hasAccess
                        ? "Le docteur a la permission d'accéder aux données de ce patient."
                        : "Le docteur n'a pas la permission d'accéder aux données de ce patient."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documentation Link */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>📚 Documentation:</strong> Pour plus d&apos;informations sur
            le contrôle d&apos;accès blockchain, consultez le fichier{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              docs/BLOCKCHAIN_ACCESS_CONTROL.md
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
