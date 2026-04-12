import { getCurrentUser } from "@/lib/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log("[Questionnaire API] User:", user);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "PATIENT") {
      return NextResponse.json(
        { error: `Invalid role: ${user.role}` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      hospital,
      department,
      specialty,
      height,
      weight,
      diabetes,
      hypertension,
      cardiacDisease,
      asthmaOuBpco,
      cancer,
      otherConditions,
      medications,
    } = body;

    // Find patient by user ID
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update patient with medical information
    // @ts-ignore - medicalBackground type is properly defined in schema
    const updateData = {
      hospital: hospital || undefined,
      department: department || undefined,
      specialty: specialty || "GENERAL_MEDICINE",
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      questionnaireCompleted: true,
      medicalBackground: {
        diabetes: diabetes || false,
        hypertension: hypertension || false,
        cardiacDisease: cardiacDisease || false,
        asthmaOuBpco: asthmaOuBpco || false,
        cancer: cancer || false,
        otherConditions: otherConditions || "",
      },
      // Clear existing medications and add new ones
      currentMedications: {
        deleteMany: {},
        create: medications
          .filter((med: any) => med.medication.trim())
          .map((med: any) => ({
            medication: med.medication,
            dose: med.dose || "",
            frequency: med.frequency || "",
            reason: med.reason || "",
          })),
      },
    };

    await prisma.patient.update({
      where: { id: patient.id },
      data: updateData as any,
    });

    return NextResponse.json({
      success: true,
      message: "Profil complété avec succès",
    });
  } catch (error) {
    console.error("Questionnaire error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du profil" },
      { status: 500 }
    );
  }
}
