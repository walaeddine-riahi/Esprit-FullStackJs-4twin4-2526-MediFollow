"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import Link from "next/link";
import {
  AlertCircle,
  Activity,
  UserCog,
  Users,
  Clock,
  Database,
  Server,
  Globe,
  Shield,
  Sparkles,
  Bot,
  Send,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAlerts: number;
  criticalAlerts: number;
  openAlerts: number;
  resolvedAlerts: number;
  userTrend7d?: number[];
  alertTrend7d?: number[];
}

interface FeedEntry {
  id: string;
  type: "alert" | "signup";
  title: string;
  desc: string;
  time: Date;
}

interface AiCopilotResult {
  answer: string;
  navigationPath?: string;
  suggestions?: string[];
}

// Animates a number from its previous value to the new target
function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === target) return;

    const start = prev;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

function AnimatedStatCard({
  label,
  value,
  icon,
  color,
  flash,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  flash: boolean;
  trend: number[];
}) {
  const animated = useCountUp(value);

  const colors: Record<string, string> = {
    indigo: "text-orange-300 bg-orange-500/15",
    emerald: "text-emerald-300 bg-emerald-500/15",
    amber: "text-amber-300 bg-amber-500/15",
    slate: "text-slate-200 bg-slate-500/20",
    rose: "text-rose-300 bg-rose-500/15",
  };

  const points = (() => {
    if (!trend || trend.length === 0) return "";
    const max = Math.max(...trend, 1);
    const min = Math.min(...trend, 0);
    const span = Math.max(max - min, 1);
    return trend
      .map((point, index) => {
        const x = (index / Math.max(trend.length - 1, 1)) * 100;
        const y = 100 - ((point - min) / span) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  })();

  return (
    <div
      className={`glass-panel glass-scan group rounded-[2rem] border border-orange-300/20 p-7 shadow-[0_20px_60px_rgba(2,6,23,0.45)] transition-all duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-6px)] ${
        flash ? "glass-neon scale-[1.04]" : ""
      }`}
    >
      <div
        className={`inline-block rounded-2xl p-3 mb-6 ${colors[color]} [transform:translateZ(20px)]`}
      >
        {icon}
      </div>
      <p className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight [transform:translateZ(28px)]">
        {animated}
      </p>
      <p className="text-xs font-bold text-slate-500 dark:text-orange-100/70 uppercase tracking-widest mt-1 [transform:translateZ(14px)]">
        {label}
      </p>
      <div className="mt-4 rounded-xl bg-slate-200/50 dark:bg-slate-900/35 p-2 [transform:translateZ(10px)]">
        <svg viewBox="0 0 100 24" className="h-6 w-full">
          <polyline
            points={points || "0,20 100,20"}
            fill="none"
            stroke="currentColor"
            className={colors[color].split(" ")[0]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  title,
  status,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-slate-100/50 dark:from-slate-800/30 to-transparent dark:to-transparent border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 dark:from-orange-900/40 to-orange-50 dark:to-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50">
          {icon}
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
      </div>
      <div className="text-right">
        <div
          className={`inline-block h-3 w-3 rounded-full ${
            active
              ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
              : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse"
          }`}
        />
        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mt-1.5">
          {status}
        </p>
      </div>
    </div>
  );
}

export default function LiveAdminDashboard({
  initialStats,
}: {
  initialStats: Stats;
}) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [flashCards, setFlashCards] = useState<Set<string>>(new Set());
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiCopilotResult | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silently ignore
    }
  }, []);

  const askCopilot = useCallback(async (query: string) => {
    const cleaned = query.trim();
    if (!cleaned) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/admin/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleaned }),
      });

      const payload = await response.json();
      if (response.ok && payload?.success && payload?.result) {
        setAiResult(payload.result as AiCopilotResult);
      } else {
        setAiResult(null);
        setAiError(payload?.error || "Copilot is unavailable right now.");
      }
    } catch {
      setAiResult(null);
      setAiError("Copilot is unavailable right now.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  const quickPrompts = [
    "unresolved critical alerts today",
    "user management summary",
    "access permissions review",
    "patients with repeated high bp",
  ];

  const addFeedEntry = useCallback((entry: Omit<FeedEntry, "id" | "time">) => {
    setFeed((prev) => [
      { ...entry, id: crypto.randomUUID(), time: new Date() },
      ...prev.slice(0, 7),
    ]);
  }, []);

  const flashCard = useCallback((keys: string[]) => {
    setFlashCards(new Set(keys));
    const timer = setTimeout(() => setFlashCards(new Set()), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const pusher = new Pusher("ba707a9085e391ba151b", { cluster: "eu" });
    const channel = pusher.subscribe("admin-updates");

    channel.bind(
      "new-alert",
      async (payload: { title?: string; desc?: string }) => {
        await refreshStats();
        addFeedEntry({
          type: "alert",
          title: payload.title || "New alert",
          desc: payload.desc || "",
        });
        flashCard(["totalAlerts", "criticalAlerts", "openAlerts"]);
      }
    );

    channel.bind(
      "new-signup",
      async (payload: { title?: string; desc?: string }) => {
        await refreshStats();
        addFeedEntry({
          type: "signup",
          title: payload.title || "New user",
          desc: payload.desc || "",
        });
        flashCard(["totalUsers", "totalPatients", "totalDoctors"]);
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-updates");
      pusher.disconnect();
    };
  }, [refreshStats, addFeedEntry, flashCard]);

  const resolvedRate =
    stats.totalAlerts > 0
      ? Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100)
      : 0;

  const quickActions = [
    {
      href: "/dashboard/admin/alerts",
      label: "Review incidents",
      desc: "Prioritize open and critical alerts",
    },
    {
      href: "/dashboard/admin/users",
      label: "Manage users",
      desc: "Roles, access, and account status",
    },
    {
      href: "/dashboard/admin/analytics",
      label: "Open analytics",
      desc: "Trends and care performance",
    },
    {
      href: "/dashboard/admin/audit",
      label: "Audit logs",
      desc: "Track admin operations and events",
    },
  ];

  const openRate =
    stats.totalAlerts > 0
      ? Math.round((stats.openAlerts / stats.totalAlerts) * 100)
      : 0;
  const criticalRate =
    stats.totalAlerts > 0
      ? Math.round((stats.criticalAlerts / stats.totalAlerts) * 100)
      : 0;

  return (
    <div className="relative">
      <div className="glass-orb pointer-events-none absolute -top-16 left-0 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="glass-orb pointer-events-none absolute top-16 right-6 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl" />

      <section className="glass-panel glass-neon glass-scan relative mb-12 overflow-hidden rounded-3xl border border-cyan-300/30 p-8 shadow-[0_40px_120px_rgba(34,211,238,0.15)] lg:p-12">
        <div className="glass-orb absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="glass-orb absolute -bottom-16 left-1/2 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl flex-1">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-300/40 mb-4">
              <p className="text-[12px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-300">
                🎯 Control Center
              </p>
            </div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-black leading-tight text-slate-900 dark:text-white">
              Operational Excellence Dashboard
            </h1>
            <p className="mt-4 text-base lg:text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
              Real-time monitoring, intelligent incident management, and
              seamless team coordination in one unified interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-fit">
            <div className="glass-panel rounded-2xl border border-rose-400/30 bg-gradient-to-br from-rose-500/10 to-rose-500/5 p-4 backdrop-blur-xl hover:border-rose-400/50 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-rose-200/70">
                ⏳ Open
              </p>
              <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                {stats.openAlerts}
              </p>
            </div>
            <div className="glass-panel rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4 backdrop-blur-xl hover:border-amber-400/50 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-amber-200/70">
                ⚡ Critical
              </p>
              <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats.criticalAlerts}
              </p>
            </div>
            <div className="glass-panel rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 backdrop-blur-xl hover:border-emerald-400/50 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-emerald-200/70">
                ✅ Resolved
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.resolvedAlerts}
              </p>
            </div>
            <div className="glass-panel rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 p-4 backdrop-blur-xl hover:border-indigo-400/50 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-indigo-200/70">
                👥 Users
              </p>
              <p className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Key Metrics
          </h2>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Last 7 days
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          <AnimatedStatCard
            label="Total Registry"
            value={stats.totalUsers}
            icon={<Users size={24} />}
            color="indigo"
            flash={flashCards.has("totalUsers")}
            trend={stats.userTrend7d || []}
          />
          <AnimatedStatCard
            label="Active Patients"
            value={stats.totalPatients}
            icon={<Activity size={24} />}
            color="emerald"
            flash={flashCards.has("totalPatients")}
            trend={stats.userTrend7d || []}
          />
          <AnimatedStatCard
            label="Verified Doctors"
            value={stats.totalDoctors}
            icon={<UserCog size={24} />}
            color="amber"
            flash={flashCards.has("totalDoctors")}
            trend={stats.userTrend7d || []}
          />
          <AnimatedStatCard
            label="Total Alerts"
            value={stats.totalAlerts}
            icon={<AlertCircle size={24} />}
            color="slate"
            flash={flashCards.has("totalAlerts")}
            trend={stats.alertTrend7d || []}
          />
          <AnimatedStatCard
            label="Critical Alerts"
            value={stats.criticalAlerts}
            icon={<AlertCircle size={24} />}
            color="rose"
            flash={flashCards.has("criticalAlerts")}
            trend={stats.alertTrend7d || []}
          />
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="glass-panel rounded-3xl border border-orange-300/30 p-8 shadow-[0_20px_80px_rgba(234,88,12,0.12)] lg:p-8 xl:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                📊 Incident Operations
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track alert resolution metrics
              </p>
            </div>
            <Link
              href="/dashboard/admin/alerts"
              className="glass-panel inline-flex items-center gap-2 rounded-xl border border-orange-400/40 bg-gradient-to-br from-orange-500/20 to-orange-500/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-300 transition hover:border-orange-400/70 hover:from-orange-500/30 hover:to-orange-500/10"
            >
              Full Details
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-7">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Resolution Rate
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                  {resolvedRate}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-style-component-with-dynamic-styles */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                  style={{ width: `${resolvedRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Open Alerts
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold">
                  {openRate}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-style-component-with-dynamic-styles */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000"
                  style={{ width: `${openRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Critical Rate
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-bold">
                  {criticalRate}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-style-component-with-dynamic-styles */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000"
                  style={{ width: `${criticalRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.slice(0, 2).map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="glass-panel rounded-2xl border border-orange-300/25 bg-gradient-to-br from-orange-500/10 to-slate-500/5 p-5 transition hover:border-orange-300/50 hover:shadow-lg hover:scale-105"
              >
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {action.label}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {action.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-cyan-300/30 p-8 shadow-[0_20px_80px_rgba(34,211,238,0.12)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                🤖 Mission Control
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                AI-powered operations insight
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-300/30">
              <Bot size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="glass-panel glass-scan rounded-2xl border border-orange-300/30 bg-gradient-to-br from-slate-50 dark:from-slate-900/50 to-slate-50/50 dark:to-slate-900/30 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-50 dark:bg-orange-900/30 p-2.5 text-orange-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Mission Control
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-orange-100/65">
                    Operational copilot
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void askCopilot(aiQuery);
                  }
                }}
                placeholder="Ask for operational insights..."
                className="flex-1 rounded-xl border border-slate-300 dark:border-orange-300/30 bg-slate-50 dark:bg-slate-900/50 py-3 px-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition"
              />
              <button
                type="button"
                onClick={() => void askCopilot(aiQuery)}
                disabled={aiLoading || !aiQuery.trim()}
                title="Send query to Mission Control"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-3 text-white font-bold transition hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setAiQuery(prompt);
                    void askCopilot(prompt);
                  }}
                  className="rounded-full border border-slate-300 dark:border-cyan-300/20 bg-slate-50 dark:bg-slate-900/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-300/50 hover:bg-cyan-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-cyan-300 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-50 dark:from-slate-800/50 to-slate-50/50 dark:to-slate-900/50 p-5 min-h-[120px] border border-slate-200 dark:border-slate-700/50">
              {aiLoading && (
                <p className="text-sm font-medium text-slate-600 dark:text-orange-300/80">
                  ✨ Analyzing your request...
                </p>
              )}
              {!aiLoading && aiError && (
                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                  {aiError}
                </p>
              )}
              {!aiLoading && !aiError && !aiResult && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose a quick prompt or ask a custom question for AI-powered
                  insights.
                </p>
              )}
              {!aiLoading && aiResult && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {aiResult.answer}
                  </p>
                  {Array.isArray(aiResult.suggestions) &&
                    aiResult.suggestions.length > 0 && (
                      <ul className="space-y-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                        {aiResult.suggestions.slice(0, 3).map((item, idx) => (
                          <li
                            key={`${item}-${idx}`}
                            className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                          >
                            <span className="text-orange-500 mt-0.5">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {quickActions.slice(2).map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="glass-panel rounded-2xl border border-orange-300/25 bg-gradient-to-r from-orange-500/10 to-transparent p-4 transition hover:border-orange-300/50 hover:shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                      {action.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-slate-400 dark:text-orange-100/60 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="glass-panel rounded-3xl border border-cyan-300/30 p-8 shadow-[0_20px_80px_rgba(34,211,238,0.12)]">
          <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
            🔧 System Health
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Infrastructure status monitoring
          </p>
          <div className="space-y-6">
            <StatusRow
              icon={<Database size={22} />}
              title="PostgreSQL"
              status="Online"
              active
            />
            <StatusRow
              icon={<Server size={22} />}
              title="REST API"
              status="Online"
              active
            />
            <StatusRow
              icon={<Globe size={22} />}
              title="Blockchain"
              status="Syncing"
              active={false}
            />
            <StatusRow
              icon={<Shield size={22} />}
              title="Auth Service"
              status="Online"
              active
            />
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-orange-300/30 p-8 shadow-[0_20px_80px_rgba(234,88,12,0.12)] xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                📡 Live Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time system events
              </p>
            </div>
            {feed.length > 0 && (
              <span className="rounded-full bg-orange-500/25 px-2.5 py-0.5 text-[10px] font-black text-orange-100">
                {feed.length}
              </span>
            )}
          </div>

          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
              <Clock size={40} className="mb-3 opacity-50" />
              <p className="text-sm font-bold">Awaiting system events...</p>
              <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">
                New alerts and signups will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {feed.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-panel flex gap-4 rounded-xl border border-cyan-300/25 bg-gradient-to-r from-slate-50/50 dark:from-slate-800/40 to-transparent dark:to-transparent p-4 animate-in slide-in-from-top-4 duration-300 hover:border-cyan-300/50 hover:shadow-md transition"
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
                      entry.type === "alert"
                        ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {entry.type === "alert" ? "🚨" : "👤"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {entry.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                      {entry.desc}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {entry.time.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
