"use client";

import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { createVitalRecord } from "@/lib/actions/vital.actions";

export default function NewVitalRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    notes: "",
    recordedAt: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "PATIENT") {
      router.push("/login");
      return;
    }

    setPatient(user.patient);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!patient?.id) {
        setError("Patient non trouvé");
        setLoading(false);
        return;
      }

      // Create FormData
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const result = await createVitalRecord(patient.id, form);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/patient");
        }, 1500);
      } else {
        setError(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <Save className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Enregistré !</h2>
          <p className="mt-2 text-gray-600">
            Vos signes vitaux ont été enregistrés avec succès
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard/patient"
            className="rounded-lg p-2 hover:bg-gray-200"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enregistrer les signes vitaux
            </h1>
            <p className="text-gray-600">
              Remplissez les mesures que vous avez prises
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Systolic BP */}
            <div>
              <label
                htmlFor="systolicBP"
                className="block text-sm font-medium text-gray-700"
              >
                Tension systolique (mmHg)
              </label>
              <input
                type="number"
                id="systolicBP"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="120"
                step="1"
                min="50"
                max="250"
              />
            </div>

            {/* Diastolic BP */}
            <div>
              <label
                htmlFor="diastolicBP"
                className="block text-sm font-medium text-gray-700"
              >
                Tension diastolique (mmHg)
              </label>
              <input
                type="number"
                id="diastolicBP"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="80"
                step="1"
                min="30"
                max="150"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label
                htmlFor="heartRate"
                className="block text-sm font-medium text-gray-700"
              >
                Fréquence cardiaque (bpm)
              </label>
              <input
                type="number"
                id="heartRate"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="70"
                step="1"
                min="30"
                max="200"
              />
            </div>

            {/* Temperature */}
            <div>
              <label
                htmlFor="temperature"
                className="block text-sm font-medium text-gray-700"
              >
                Température (°C)
              </label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="36.5"
                step="0.1"
                min="34"
                max="42"
              />
            </div>

            {/* Oxygen Saturation */}
            <div>
              <label
                htmlFor="oxygenSaturation"
                className="block text-sm font-medium text-gray-700"
              >
                SpO2 (%)
              </label>
              <input
                type="number"
                id="oxygenSaturation"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="98"
                step="1"
                min="70"
                max="100"
              />
            </div>

            {/* Weight */}
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700"
              >
                Poids (kg) - Optionnel
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="70"
                step="0.1"
                min="30"
                max="300"
              />
            </div>

            {/* Recorded At */}
            <div className="md:col-span-2">
              <label
                htmlFor="recordedAt"
                className="block text-sm font-medium text-gray-700"
              >
                Date et heure de la mesure
              </label>
              <input
                type="datetime-local"
                id="recordedAt"
                name="recordedAt"
                value={formData.recordedAt}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ajoutez des notes sur votre état général, symptômes, etc."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 inline animate-spin" size={20} />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 inline" size={20} />
                  Enregistrer
                </>
              )}
            </button>
            <Link
              href="/dashboard/patient"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
