"use client";

import {
  ArrowLeft,
  Send,
  Flag,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getCoordinatorPatientDetail,
  sendCoordinatorReminder,
  flagCoordinatorEntry,
} from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

export default function CoordinatorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [reminderMsg, setReminderMsg] = useState(
    "Bonjour, merci de compléter vos constantes vitales pour aujourd'hui dans MediFollow."
  );
  const [channels, setChannels] = useState({
    IN_APP: true,
    EMAIL: false,
    SMS: false,
  });
  const [sending, setSending] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const [flagType, setFlagType] = useState<"INCOMPLETE" | "SUSPICIOUS" | "OTHER">(
    "INCOMPLETE"
  );
  const [flagVitalId, setFlagVitalId] = useState<string>("");
  const [flagging, setFlagging] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBundle, setAiBundle] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  async function reload() {
    const res = await getCoordinatorPatientDetail(patientId);
    if (res.success && res.data) setDetail(res.data);
    else if (!res.success) router.push("/dashboard/coordinator/patients");
  }

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      await reload();
      setLoading(false);
    })();
  }, [patientId, router]);

  async function handleSendReminder() {
    setSending(true);
    const ch: ("IN_APP" | "EMAIL" | "SMS")[] = [];
    if (channels.IN_APP) ch.push("IN_APP");
    if (channels.EMAIL) ch.push("EMAIL");
    if (channels.SMS) ch.push("SMS");
    await sendCoordinatorReminder(patientId, reminderMsg, ch);
    setSending(false);
  }

  async function handleAiBundle() {
    if (!detail) return;
    const { patient, vitalsWithCompleteness } = detail;
    const latest = vitalsWithCompleteness[0];
    if (!latest) return;
    setAiLoading(true);
    setAiError(null);
    setAiBundle(null);
    const dob = patient.dateOfBirth
      ? new Date(patient.dateOfBirth)
      : null;
    const ageYears =
      dob != null
        ? Math.floor(
            (Date.now() - dob.getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : undefined;
    try {
      const res = await fetch("/api/coordinator/ai/vitals-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systolicBP: latest.systolicBP,
          diastolicBP: latest.diastolicBP,
          heartRate: latest.heartRate,
          temperature: latest.temperature,
          oxygenSaturation: latest.oxygenSaturation,
          weight: latest.weight,
          notes: [latest.notes, aiNotes.trim()].filter(Boolean).join("\n") || undefined,
          patientContext: {
            age: ageYears,
            pathology: patient.diagnosis ?? undefined,
            dischargeDate: patient.dischargeDate
              ? new Date(patient.dischargeDate).toISOString()
              : undefined,
          },
          triageText: aiNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAiError((data.detail || data.error || "Erreur") as string);
        return;
      }
      setAiBundle(data);
    } catch (e: unknown) {
      setAiError(String((e as Error)?.message ?? e));
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFlag() {
    setFlagError(null);
    if (!flagNote.trim()) return;

    const selectedVital = detail.vitalsWithCompleteness.find(
      (v: any) => v.id === flagVitalId
    );

    if (
      flagType === "INCOMPLETE" &&
      selectedVital?.completeness?.score === 100
    ) {
      setFlagError(
        "Impossible de signaler une entrée incomplète lorsque la complétude est déjà 100%."
      );
      return;
    }

    setFlagging(true);
    await flagCoordinatorEntry(patientId, {
      vitalRecordId: flagVitalId || undefined,
      flagType,
      note: flagNote.trim(),
    });
    setFlagNote("");
    setFlagVitalId("");
    setFlagging(false);
    await reload();
  }

  if (loading || !detail) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const { patient, compliance, vitalsWithCompleteness } = detail;

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/coordinator/patients"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="size-4" />
          Retour à la liste
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {patient.user.firstName} {patient.user.lastName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {patient.medicalRecordNumber} · {patient.user.email}
            </p>
          </div>
          <div className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2 text-right">
            <p className="text-xs text-gray-500 uppercase">Score global</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {compliance.overallScore}%
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500">Const. (7 j.)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {compliance.dailyCompliance7d}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500">Symptômes (7 j.)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {compliance.symptomCompliance7d}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500">Quest. (7 j.)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {compliance.questionnaireCount7d} · {compliance.questionnaireScore7d}%
            </p>
          </div>
        </div>

        {/* Rappel */}
        <section className="mt-10 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="size-5 text-blue-600" />
            Envoyer un rappel
          </h2>
          <textarea
            value={reminderMsg}
            onChange={(e) => setReminderMsg(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm"
          />
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.IN_APP}
                onChange={(e) =>
                  setChannels((c) => ({ ...c, IN_APP: e.target.checked }))
                }
              />
              Application
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.EMAIL}
                onChange={(e) =>
                  setChannels((c) => ({ ...c, EMAIL: e.target.checked }))
                }
              />
              Email
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.SMS}
                onChange={(e) =>
                  setChannels((c) => ({ ...c, SMS: e.target.checked }))
                }
              />
              SMS
            </label>
          </div>
          <button
            type="button"
            disabled={sending}
            onClick={handleSendReminder}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Envoyer
          </button>
        </section>

        {/* Signalement */}
        <section className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flag className="size-5 text-amber-600" />
            Signaler une entrée incomplète ou suspecte
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={flagType}
              onChange={(e) =>
                setFlagType(e.target.value as typeof flagType)
              }
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 text-sm"
            >
              <option value="INCOMPLETE">Entrée incomplète</option>
              <option value="SUSPICIOUS">Valeur suspecte</option>
              <option value="OTHER">Autre</option>
            </select>
            <select
              value={flagVitalId}
              onChange={(e) => setFlagVitalId(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 text-sm"
            >
              <option value="">— Mesure vitale (optionnel) —</option>
              {vitalsWithCompleteness.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {formatDateTime(v.recordedAt)} — compl. {v.completeness.score}%
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="Note pour l'équipe soignante…"
            rows={2}
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm"
          />
          <button
            type="button"
            disabled={
              flagging ||
              !flagNote.trim() ||
              (flagType === "INCOMPLETE" &&
                vitalsWithCompleteness.find((v: any) => v.id === flagVitalId)
                  ?.completeness?.score === 100)
            }
            onClick={handleFlag}
            className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Enregistrer le signalement
          </button>
          {flagError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {flagError}
            </p>
          )}
        </section>

        {/* Vitals */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Dernières mesures vitales
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/80">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2">TA</th>
                  <th className="px-3 py-2">FC</th>
                  <th className="px-3 py-2">Temp</th>
                  <th className="px-3 py-2">SpO₂</th>
                  <th className="px-3 py-2">Complétude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {vitalsWithCompleteness.map((v: any) => (
                  <tr key={v.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDateTime(v.recordedAt)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {v.systolicBP ?? "—"}/{v.diastolicBP ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center">{v.heartRate ?? "—"}</td>
                    <td className="px-3 py-2 text-center">{v.temperature ?? "—"}</td>
                    <td className="px-3 py-2 text-center">
                      {v.oxygenSaturation ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          v.completeness.isComplete
                            ? "text-emerald-600 font-semibold"
                            : "text-amber-600 font-semibold"
                        }
                      >
                        {v.completeness.score}%
                      </span>
                      {!v.completeness.isComplete && (
                        <span className="block text-xs text-gray-500">
                          {v.completeness.issues.join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="size-5 text-blue-600" />
            Analyse IA — Mistral + BiomedBERT
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Utilise la dernière ligne de mesures ci-dessus. Optionnel : contexte ou symptômes pour le
            triage texte.
          </p>
          <textarea
            value={aiNotes}
            onChange={(e) => setAiNotes(e.target.value)}
            rows={2}
            placeholder="Notes ou symptômes pour affiner le triage (optionnel)…"
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm"
          />
          <button
            type="button"
            disabled={aiLoading || vitalsWithCompleteness.length === 0}
            onClick={handleAiBundle}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Lancer l&apos;analyse
          </button>
          {vitalsWithCompleteness.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">Aucune mesure vitale à analyser.</p>
          )}
          {aiError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{aiError}</p>
          )}
          {aiBundle?.clinical && (
            <div className="mt-4 space-y-3 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-white/90 dark:bg-gray-950/90 p-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-blue-600">Mistral — JSON clinique</p>
                <p className="mt-1">
                  <span className="font-semibold">Score risque :</span>{" "}
                  {aiBundle.clinical.scoreRisque}/100
                </p>
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {aiBundle.clinical.recommandationFR}
                </p>
                {aiBundle.clinical.parametresFlagges?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Paramètres flaggés :</span>{" "}
                    {aiBundle.clinical.parametresFlagges.join(", ")}
                  </p>
                )}
              </div>
              {aiBundle.triage && (
                <div className="border-t border-blue-100 dark:border-blue-900/40 pt-3">
                  <p className="text-xs font-bold uppercase text-blue-600">BiomedBERT — triage</p>
                  <p className="mt-1">
                    Alerte probable :{" "}
                    <span className="font-semibold">
                      {aiBundle.triage.alerteProbable ? "oui" : "non"}
                    </span>{" "}
                    · Priorité : {aiBundle.triage.priorite}
                  </p>
                  {aiBundle.triage.labelBrut && (
                    <p className="text-xs text-gray-500 mt-1">{aiBundle.triage.labelBrut}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Questionnaires */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Questionnaires récents
          </h2>
          <ul className="space-y-2">
            {patient.questionnaires?.length === 0 ? (
              <li className="text-sm text-gray-500">Aucun questionnaire.</li>
            ) : (
              patient.questionnaires.map((q: any) => (
                <li
                  key={q.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between gap-4"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {q.questionnaireType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(q.completedAt)} · score{" "}
                    {q.overallScore != null ? q.overallScore : "—"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
