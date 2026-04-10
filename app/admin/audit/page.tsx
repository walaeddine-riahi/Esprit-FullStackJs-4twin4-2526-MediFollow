"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { AuditDashboard } from "@/components/AuditDashboard";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function AuditPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();

        // Check if user is admin or auditor
        if (
          !user ||
          (user.role !== "ADMIN" && user.role !== ("AUDITOR" as any))
        ) {
          redirect("/login");
        }
      } catch (error) {
        redirect("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <AuditDashboard />;
}
