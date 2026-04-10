"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  AlertCircle,
  Activity,
  Search,
  Moon,
  Sun,
  Plus,
  Send,
  Heart,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { logout } from "@/lib/actions/auth.actions";
import { getNurseAlerts } from "@/lib/actions/nurse.actions";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AlertStatus } from "@/types/medifollow.types";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function NurseLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NurseLayoutInner>{children}</NurseLayoutInner>
    </ThemeProvider>
  );
}

function NurseLayoutInner({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(0);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
    const sidebarHandler = () => setSidebarOpen(true);
    document.addEventListener("sidebar:open", sidebarHandler);
    return () => document.removeEventListener("sidebar:open", sidebarHandler);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) return;

      // Load alert data
      const result = await getNurseAlerts(currentUser.id);
      if (result.success) {
        setOpenAlertsCount(result.stats?.open || 0);
        setRecentAlerts(result.alerts.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const navigationItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Tableau de bord",
      href: "/dashboard/nurse",
    },
    {
      icon: Users,
      label: "Mes patients",
      href: "/dashboard/nurse/patients",
    },
    {
      icon: AlertCircle,
      label: "Alertes",
      href: "/dashboard/nurse/alerts",
      badge: openAlertsCount,
    },
    {
      icon: Clock,
      label: "Rappels",
      href: "/dashboard/nurse/reminders",
    },
    {
      icon: User,
      label: "Profil",
      href: "/dashboard/nurse/profile",
    },
    {
      icon: Settings,
      label: "Paramètres",
      href: "/dashboard/nurse/settings",
    },
  ];

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} min-h-screen bg-white dark:bg-gray-900`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo - Style MediFollow avec gradient rose */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5">
          <Link
            href="/"
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 dark:from-white dark:to-gray-100 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
              <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 via-pink-700 to-pink-700 p-2 shadow-lg shadow-pink-500/30 dark:shadow-white/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-pink-500/50 dark:group-hover:shadow-white/50">
                <Activity className="size-7 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black leading-none bg-gradient-to-r from-pink-600 via-pink-700 to-pink-700 bg-clip-text text-transparent">
                MediFollow
              </span>
              <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-500 tracking-wider uppercase">
                ESPACE INFIRMIÈRE
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-600 dark:text-gray-400"
            title="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400"
                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-max h-6 px-2 rounded-full bg-red-100 dark:bg-red-500/20 text-xs font-bold text-red-600 dark:text-red-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-sm font-medium transition-all"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-6">
            {/* Left: Menu and Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600 dark:text-gray-400"
                title="Ouvrir le menu"
              >
                <Menu size={24} />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Chercher un patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Right: Theme Toggle and Notifications */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <Bell size={20} />
                  {openAlertsCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white">
                      {openAlertsCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Alertes récentes
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {recentAlerts.length > 0 ? (
                        recentAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(alert.createdAt).toLocaleString("fr")}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucune alerte
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                {profileImage && (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.firstName || "Infirmière"}
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {user?.role || "NURSE"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8">{children}</div>
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}
    </div>
  );
}
