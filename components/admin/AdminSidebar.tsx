"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  AlertCircle,
  BarChart3,
  Users,
  FileText,
  Settings,
  Download,
  Clock,
  Search,
  CheckSquare,
  Activity,
} from "lucide-react";

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { icon: AlertCircle, label: "Alertes", href: "/dashboard/admin/alerts" },
    { icon: BarChart3, label: "Analyses", href: "/dashboard/admin/analytics" },
    { icon: Users, label: "Utilisateurs", href: "/dashboard/admin/users" },
    { icon: Activity, label: "Services", href: "/dashboard/admin/services" },
    {
      icon: FileText,
      label: "Questionnaires",
      href: "/dashboard/admin/questionnaires",
    },
    {
      icon: Clock,
      label: "Patients en Attente",
      href: "/dashboard/admin/pending-patients",
    },
    { icon: Download, label: "Export", href: "/dashboard/admin/export" },
    { icon: Search, label: "Recherche", href: "/dashboard/admin/search" },
    { icon: CheckSquare, label: "Audit", href: "/dashboard/admin/audit" },
    { icon: Settings, label: "Paramètres", href: "/dashboard/admin/settings" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <Link href="/dashboard/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center font-bold text-slate-900">
              A
            </div>
            {isOpen && <span className="font-bold text-lg">Admin</span>}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <Icon size={20} />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Spacer */}
      {isOpen && <div className="w-64" />}
    </>
  );
}
