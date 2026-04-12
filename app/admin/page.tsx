<<<<<<< HEAD
import { getAlertStats } from "@/lib/actions/alert.actions";
import { getAllUsers } from "@/lib/actions/admin.actions";
import LiveAdminDashboard from "@/components/admin/LiveAdminDashboard";
import Link from "next/link";

export default async function AdminDashboard() {
  const alertRes = await getAlertStats();
  const alertData = alertRes?.stats ?? {
    total: 0,
    critical: 0,
    open: 0,
    resolved: 0,
  };
  const allUsers = await getAllUsers();
  const initialStats = {
    totalAlerts: alertData.total || 0,
    criticalAlerts: alertData.critical || 0,
    openAlerts: alertData.open || 0,
    resolvedAlerts: alertData.resolved || 0,
    totalUsers: allUsers.length,
    totalDoctors: allUsers.filter((u: any) => u.role === "DOCTOR").length,
    totalPatients: allUsers.filter((u: any) => u.role === "PATIENT").length,
  };

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
        <Link
          href="/admin/alerts"
          className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/25 p-3 text-sm font-bold text-slate-700 dark:text-cyan-100"
        >
          Incidents
        </Link>
        <Link
          href="/admin/users"
          className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/25 p-3 text-sm font-bold text-slate-700 dark:text-cyan-100"
        >
          Users
        </Link>
        <Link
          href="/admin/analytics"
          className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/25 p-3 text-sm font-bold text-slate-700 dark:text-cyan-100"
        >
          Analytics
        </Link>
      </div>
      <LiveAdminDashboard initialStats={initialStats} />
    </>
  );
}
=======
import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <DataTable columns={columns} data={appointments.documents} />
      </main>
    </div>
  );
};

export default AdminPage;
>>>>>>> ai-features-backup
