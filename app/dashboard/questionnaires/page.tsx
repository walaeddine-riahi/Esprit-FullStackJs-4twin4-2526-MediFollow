import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import QuestionnaireManagement from "@/components/QuestionnaireManagement";

export const metadata = {
  title: "Questionnaires | MediFollow",
  description: "Manage patient questionnaires",
};

export default async function QuestionnairesPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // Only doctors can access this page
  if (user.role !== "DOCTOR") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <QuestionnaireManagement />
    </div>
  );
}
