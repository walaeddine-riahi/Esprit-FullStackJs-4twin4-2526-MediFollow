"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  AlertCircle,
  Activity,
  FileText,
  Heart,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { logout } from "@/lib/actions/auth.actions";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function DoctorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Tableau de bord",
      href: "/dashboard/doctor",
    },
    {
      icon: Users,
      label: "Patients",
      href: "/dashboard/doctor/patients",
    },
    {
      icon: Bell,
      label: "Alertes",
      href: "/dashboard/doctor/alerts",
      badge: 3,
    },
    {
      icon: Activity,
      label: "Signes vitaux",
      href: "/dashboard/doctor/vitals",
    },
    {
      icon: BarChart3,
      label: "Analyses",
      href: "/dashboard/doctor/analytics",
    },
    {
      icon: FileText,
      label: "Rapports",
      href: "/dashboard/doctor/reports",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="size-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MediFollow</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`size-5 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Settings */}
        <div className="p-3">
          <Link
            href="/dashboard/doctor/settings"
            className={`group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === "/dashboard/doctor/settings"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Settings className="size-5 text-gray-500" />
            <span>Paramètres</span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center space-x-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">
                  Dr. {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
              title="Déconnexion"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <Menu className="size-6" />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="size-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">MediFollow</span>
          </Link>
          <div className="size-10"></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
