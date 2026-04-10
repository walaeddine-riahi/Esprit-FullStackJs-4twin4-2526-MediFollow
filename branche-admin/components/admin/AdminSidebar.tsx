"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import {
  Users,
  AlertCircle,
  Settings,
  FileText,
  TrendingUp,
  Building2,
  LayoutDashboard,
  UserCircle,
  Activity,
  ClipboardList,
  Download,
  Clock,
} from "lucide-react";

const managementLinks: {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}[] = [
  {
    href: "/dashboard/admin",
    icon: <LayoutDashboard size={20} />,
    label: "Overview",
    exact: true,
  },
  {
    href: "/dashboard/admin/users",
    icon: <Users size={20} />,
    label: "User Registry",
  },
  {
    href: "/dashboard/admin/pending-patients",
    icon: <Clock size={20} />,
    label: "Pending Patients",
  },
  {
    href: "/dashboard/admin/services",
    icon: <Building2 size={20} />,
    label: "Service Management",
  },
  {
    href: "/dashboard/admin/questionnaires",
    icon: <ClipboardList size={20} />,
    label: "Questionnaires",
  },
  {
    href: "/dashboard/admin/alerts",
    icon: <AlertCircle size={20} />,
    label: "Incidents",
  },
  {
    href: "/dashboard/admin/audit",
    icon: <FileText size={20} />,
    label: "Audit Logs",
  },
];

const infraLinks: {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}[] = [
  {
    href: "/dashboard/admin/profile",
    icon: <UserCircle size={20} />,
    label: "Mon Profil",
  },
  {
    href: "/dashboard/admin/analytics",
    icon: <TrendingUp size={20} />,
    label: "Analytics",
  },
  {
    href: "/dashboard/admin/export",
    icon: <Download size={20} />,
    label: "Data Export",
  },
  {
    href: "/dashboard/admin/settings",
    icon: <Settings size={20} />,
    label: "Settings",
  },
];

function NavItem({
  href,
  icon,
  label,
  active,
  badge = 0,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all ${
        active
          ? "glass-neon bg-gradient-to-r from-orange-500/35 to-orange-600/35 text-white dark:text-white"
          : "text-slate-600 dark:text-orange-100/80 hover:bg-slate-200/60 dark:hover:bg-orange-500/12"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      {badge > 0 && (
        <span className="rounded-lg bg-orange-400/20 px-2 py-0.5 text-[10px] font-black text-orange-700 dark:text-orange-200">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="glass-panel fixed left-0 top-0 hidden h-full w-72 border-r border-slate-200 dark:border-orange-300/20 lg:block z-40">
      <div className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-orange-300/20 px-8">
        <Link
          href="/dashboard/admin"
          className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 dark:from-white dark:to-gray-100 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
            <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-orange-700 p-2 shadow-lg shadow-orange-500/30 dark:shadow-white/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/50 dark:group-hover:shadow-white/50">
              <Activity className="size-7 text-white animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black leading-none bg-gradient-to-r from-orange-600 via-orange-700 to-orange-700 bg-clip-text text-transparent">
              MediFollow
            </span>
            <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-500 tracking-wider uppercase">
              Alertes Critiques
            </span>
          </div>
        </Link>
      </div>
      <div className="px-4 py-4 overflow-y-auto h-[calc(100vh-80px)]">
        <div className="mb-2 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-orange-200/80">
          MANAGEMENT
        </div>
        <nav className="space-y-1">
          {managementLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={isActive(link.href, link.exact)}
            />
          ))}
        </nav>
        <div className="mb-2 mt-8 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-orange-200/80">
          INFRASTRUCTURE
        </div>
        <nav className="space-y-1">
          {infraLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={isActive(link.href, link.exact)}
            />
          ))}
        </nav>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-orange-300/20">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
