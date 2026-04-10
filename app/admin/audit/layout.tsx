"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  FileText,
  Users,
  Activity,
  Settings,
  User,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { logout } from "@/lib/actions/auth.actions";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function AuditLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuditLayoutInner>{children}</AuditLayoutInner>
    </ThemeProvider>
  );
}

function AuditLayoutInner({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
    const sidebarHandler = () => setSidebarOpen(true);
    document.addEventListener("sidebar:open", sidebarHandler);
    return () => document.removeEventListener("sidebar:open", sidebarHandler);
  }, []);

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      if (
        !currentUser ||
        (currentUser.role !== "ADMIN" &&
          currentUser.role !== ("AUDITOR" as any))
      ) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    } catch {
      router.push("/login");
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Tableau de bord",
      href: "/admin/audit",
    },
    {
      icon: Activity,
      label: "Logs d'Audit",
      href: "/admin/audit/logs",
    },
    {
      icon: Users,
      label: "Utilisateurs",
      href: "/admin/audit/users",
    },
    {
      icon: FileText,
      label: "Rapports",
      href: "/admin/audit/reports",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black transition-colors">
      {/* Sidebar - Purple Audit Style */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5">
          <Link
            href="/admin/audit"
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 dark:from-white dark:to-gray-100 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
              <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-700 p-2 shadow-lg shadow-purple-500/30 dark:shadow-white/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/50 dark:group-hover:shadow-white/50">
                <Shield className="size-7 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black leading-none bg-gradient-to-r from-purple-600 via-purple-700 to-purple-700 bg-clip-text text-transparent">
                Audit
              </span>
              <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-500 tracking-wider uppercase">
                Conformité
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/10 to-purple-400/10 dark:from-purple-500/20 dark:to-purple-400/20 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-purple-500 to-purple-400 rounded-r-full"></div>
                  )}
                  <Icon className="size-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-500 dark:to-purple-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm dark:shadow-purple-500/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Paramètres
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group w-full flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              <span className="flex-1 text-left">
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group w-full flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut className="size-5" />
              <span className="flex-1 text-left">Déconnexion</span>
            </button>
          </div>
        </nav>

        {/* User Profile Card */}
        {user && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-3">
            <div className="relative rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/90 dark:to-purple-700/90 p-4 shadow-lg overflow-hidden border dark:border-purple-500/20">
              {/* Decorative background effect */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

              {/* Content */}
              <div className="relative flex items-center gap-3">
                {/* Avatar */}
                <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                  <span className="text-white font-bold text-base">
                    {user?.firstName?.[0] ?? "A"}
                    {user?.lastName?.[0] ?? ""}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email}
                  </p>
                  <p className="truncate text-xs opacity-90 text-white">
                    {user?.role || "Auditeur"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="size-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion d'Audit
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
