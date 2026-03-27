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
    // Symptômes
    painChecked: false,
    painIntensity: 0,
    fatigueChecked: false,
    fatigueIntensity: 0,
    breathlessnessChecked: false,
    breathlessnessIntensity: 0,
    nauseaChecked: false,
    nauseaIntensity: 0,
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

  const handleCheckboxChange = (symptom: string) => {
    setFormData({
      ...formData,
      [`${symptom}Checked`]: !formData[`${symptom}Checked` as keyof typeof formData],
    });
  };

  const handleSliderChange = (symptom: string, value: number) => {
    setFormData({
      ...formData,
      [`${symptom}Intensity`]: value,
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
        if (value !== "" && value !== false) {
          form.append(key, value.toString());
        }
      });

      // Ajouter les symptômes comme JSON
      const symptoms = {
        pain: {
          checked: formData.painChecked,
          intensity: formData.painChecked ? formData.painIntensity : undefined,
        },
        fatigue: {
          checked: formData.fatigueChecked,
          intensity: formData.fatigueChecked ? formData.fatigueIntensity : undefined,
        },
        breathlessness: {
          checked: formData.breathlessnessChecked,
          intensity: formData.breathlessnessChecked ? formData.breathlessnessIntensity : undefined,
        },
        nausea: {
          checked: formData.nauseaChecked,
          intensity: formData.nauseaChecked ? formData.nauseaIntensity : undefined,
        },
      };
      form.append("symptoms", JSON.stringify(symptoms));

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50">
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/patient"
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Enregistrer les signes vitaux
              </h1>
              <p className="mt-2 text-gray-600">
                Remplissez les mesures que vous avez prises
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-8"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Systolic BP */}
            <div>
              <label
                htmlFor="systolicBP"
                className="block text-sm font-medium text-gray-700"
              >
                 Tension systolique (mmHg) *
              </label>
              <input
                type="number"
                id="systolicBP"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder="120"
                step="1"
                min="70"
                max="250"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Min: 70 - Max: 250</p>
            </div>

            {/* Diastolic BP */}
            <div>
              <label
                htmlFor="diastolicBP"
                className="block text-sm font-medium text-gray-700"
              >
                 Tension diastolique (mmHg) *
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
                min="40"
                max="150"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Min: 40 - Max: 150</p>
            </div>

            {/* Heart Rate */}
            <div>
              <label
                htmlFor="heartRate"
                className="block text-sm font-medium text-gray-700"
              >
                 Fréquence cardiaque (bpm) *
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
                max="220"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Min: 30 - Max: 220</p>
            </div>

            {/* Temperature */}
            <div>
              <label
                htmlFor="temperature"
                className="block text-sm font-medium text-gray-700"
              >
                 Température (°C) *
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
                required
              />
              <p className="mt-1 text-xs text-gray-500">Min: 34°C - Max: 42°C</p>
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
                 Poids (kg) *
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
                min="20"
                max="300"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Min: 20 - Max: 300</p>
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

          {/* SECTION 3 — Symptômes */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
               Symptômes
            </h2>
            <div className="space-y-6">
              {/* Douleur */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="painChecked"
                    checked={formData.painChecked}
                    onChange={() => handleCheckboxChange("pain")}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="painChecked"
                    className="text-base font-medium text-gray-900"
                  >
                    Douleur
                  </label>
                </div>
                {formData.painChecked && (
                  <div className="ml-8 space-y-2">
                    <label className="block text-sm text-gray-700">
                      Intensité : <span className="font-semibold text-blue-600">{formData.painIntensity}/10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.painIntensity}
                      onChange={(e) => handleSliderChange("pain", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 - Aucune</span>
                      <span>10 - Insupportable</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fatigue */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="fatigueChecked"
                    checked={formData.fatigueChecked}
                    onChange={() => handleCheckboxChange("fatigue")}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="fatigueChecked"
                    className="text-base font-medium text-gray-900"
                  >
                    Fatigue
                  </label>
                </div>
                {formData.fatigueChecked && (
                  <div className="ml-8 space-y-2">
                    <label className="block text-sm text-gray-700">
                      Intensité : <span className="font-semibold text-blue-600">{formData.fatigueIntensity}/10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.fatigueIntensity}
                      onChange={(e) => handleSliderChange("fatigue", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 - Aucune</span>
                      <span>10 - Épuisement total</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Essoufflement */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="breathlessnessChecked"
                    checked={formData.breathlessnessChecked}
                    onChange={() => handleCheckboxChange("breathlessness")}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="breathlessnessChecked"
                    className="text-base font-medium text-gray-900"
                  >
                    Essoufflement
                  </label>
                </div>
                {formData.breathlessnessChecked && (
                  <div className="ml-8 space-y-2">
                    <label className="block text-sm text-gray-700">
                      Intensité : <span className="font-semibold text-blue-600">{formData.breathlessnessIntensity}/10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.breathlessnessIntensity}
                      onChange={(e) => handleSliderChange("breathlessness", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 - Aucun</span>
                      <span>10 - Très sévère</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Nausée */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="nauseaChecked"
                    checked={formData.nauseaChecked}
                    onChange={() => handleCheckboxChange("nausea")}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="nauseaChecked"
                    className="text-base font-medium text-gray-900"
                  >
                    Nausée
                  </label>
                </div>
                {formData.nauseaChecked && (
                  <div className="ml-8 space-y-2">
                    <label className="block text-sm text-gray-700">
                      Intensité : <span className="font-semibold text-blue-600">{formData.nauseaIntensity}/10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.nauseaIntensity}
                      onChange={(e) => handleSliderChange("nausea", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 - Aucune</span>
                      <span>10 - Très sévère</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Enregistrer
                </>
              )}
            </button>
            <Link
              href="/dashboard/patient"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 flex items-center justify-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
