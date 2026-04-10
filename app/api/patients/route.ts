import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is a doctor or admin
    const user = await getCurrentUser();
    console.log("🔵 [API /patients] Current user:", {
      id: user?.id,
      email: user?.email,
      role: user?.role,
    });

    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      console.log("🔴 [API /patients] User not authorized:", user?.role);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch patients that have an active AccessGrant with this doctor
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        doctorId: user.id,
        isActive: true,
      },
      select: {
        patientId: true,
      },
    });

    console.log("🔵 [API /patients] AccessGrants found:", accessGrants.length);

    const patientIds = accessGrants.map((grant) => grant.patientId);
    console.log("🔵 [API /patients] Patient User IDs to lookup:", patientIds);

    // Fetch the patient details
    const patients = await prisma.patient.findMany({
      where: {
        userId: {
          in: patientIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });

    console.log("🔵 [API /patients] Patients returned:", patients.length);

    return NextResponse.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
