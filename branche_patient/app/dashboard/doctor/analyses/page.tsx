import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import AnalysisManagement from "@/components/AnalysisManagement";

export default async function DoctorAnalysisPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <AnalysisManagement />
    </div>
  );
}
