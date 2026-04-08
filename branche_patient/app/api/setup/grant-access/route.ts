import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { grantAccessToDoctor } from "@/lib/actions/patient-access.actions";

export async function POST(request: NextRequest) {
  try {
    const { patientEmail, doctorEmail } = await request.json();

    if (!patientEmail || !doctorEmail) {
      return NextResponse.json(
        { error: "Patient email and doctor email are required" },
        { status: 400 }
      );
    }

    // Find patient by email
    const patientUser = await prisma.user.findUnique({
      where: { email: patientEmail },
      select: { id: true },
    });

    if (!patientUser) {
      return NextResponse.json(
        { error: `Patient with email ${patientEmail} not found` },
        { status: 404 }
      );
    }

    // Find patient profile to get patient ID (for blockchain)
    const patientProfile = await prisma.patient.findUnique({
      where: { userId: patientUser.id },
      select: { id: true },
    });

    if (!patientProfile) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Find doctor by email
    const doctorUser = await prisma.user.findUnique({
      where: { email: doctorEmail },
      select: { id: true, role: true },
    });

    if (!doctorUser) {
      return NextResponse.json(
        { error: `Doctor with email ${doctorEmail} not found` },
        { status: 404 }
      );
    }

    if (doctorUser.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "User is not a doctor" },
        { status: 400 }
      );
    }

    // Grant access
    const result = await grantAccessToDoctor(
      patientUser.id,
      patientProfile.id,
      doctorUser.id,
      365
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Access granted to doctor ${doctorEmail} for patient ${patientEmail}`,
      txHash: result.txHash,
    });
  } catch (error) {
    console.error("Error granting access:", error);
    return NextResponse.json(
      { error: "Failed to grant access" },
      { status: 500 }
    );
  }
}
