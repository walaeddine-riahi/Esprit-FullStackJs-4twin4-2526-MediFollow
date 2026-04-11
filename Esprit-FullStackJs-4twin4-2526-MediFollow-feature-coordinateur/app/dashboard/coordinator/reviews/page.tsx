"use client";

import { ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getCoordinatorOpenFlags,
  resolveCoordinatorFlag,
} from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

export default function CoordinatorReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await getCoordinatorOpenFlags();
    if (res.success && res.flags) setFlags(res.flags);
  }

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      await load();
      setLoading(false);
    })();
  }, [router]);

  async function resolve(id: string) {
    setBusy(id);
    await resolveCoordinatorFlag(id);
    await load();
    setBusy(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="size-7 text-amber-600" />
          Revues & signalements
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Entrées signalées comme incomplètes ou suspectes — à traiter ou
          clôturer.
        </p>

        <ul className="mt-8 space-y-4">
          {flags.length === 0 ? (
            <li className="text-sm text-gray-500">
              Aucun signalement ouvert.
            </li>
          ) : (
            flags.map((f) => (
              <li
                key={f.id}
                className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-5"
              >
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/dashboard/coordinator/patients/${f.patientId}`}
                    className="font-bold text-gray-900 dark:text-white hover:text-blue-600"
                  >
                    {f.patient.user.firstName} {f.patient.user.lastName}
                  </Link>
                  <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-200">
                    {f.flagType}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTime(f.createdAt)}
                </p>
                <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                  {f.note}
                </p>
                {f.vitalRecord && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Mesure liée : {formatDateTime(f.vitalRecord.recordedAt)}
                  </p>
                )}
                <button
                  type="button"
                  disabled={busy === f.id}
                  onClick={() => resolve(f.id)}
                  className="mt-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {busy === f.id ? "…" : "Clôturer"}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
