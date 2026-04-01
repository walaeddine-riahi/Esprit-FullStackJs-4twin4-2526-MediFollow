"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// QUESTIONNAIRE TEMPLATES
// ============================================

export async function createQuestionnaireTemplate(input: {
  title: string;
  description?: string;
  type: string;
  questions: any[];
  createdBy?: string;
}) {
  try {
    const { title, description, type, questions, createdBy } = input;

    if (!title || !type || questions.length === 0) {
      return {
        success: false,
        error: "Title, type, and at least one question are required",
      };
    }

    // If createdBy is not provided, we can use a default or handle it differently
    // For now, we'll require it to be provided from the page
    if (!createdBy) {
      return { success: false, error: "Doctor ID is required" };
    }

    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        description: description || "",
        type,
        createdBy,
        questions: {
          create: questions.map((q, index) => ({
            order: index,
            title: q.title,
            description: q.description || "",
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : null,
            required: q.required !== false,
            minValue: q.minValue || null,
            maxValue: q.maxValue || null,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            questions: true,
            assignments: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/doctor/questionnaires");
    return { success: true, questionnaire };
  } catch (error: any) {
    console.error("Create questionnaire error:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuestionnaireTemplates() {
  try {
    const questionnaires = await prisma.questionnaire.findMany({
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            questions: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, questionnaires };
  } catch (error: any) {
    console.error("Get questionnaires error:", error);
    return { success: false, error: error.message, questionnaires: [] };
  }
}

export async function getQuestionnaireTemplate(id: string) {
  try {
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    return { success: true, questionnaire };
  } catch (error: any) {
    console.error("Get questionnaire error:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// QUESTIONNAIRE ASSIGNMENTS
// ============================================

export async function assignQuestionnaire(
  questionnaireId: string,
  patientId: string,
  dueDate: Date
) {
  try {
    const assignment = await prisma.questionnaireAssignment.create({
      data: {
        questionnaireId,
        patientId,
        dueDate,
      },
      include: {
        questionnaire: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    revalidatePath(`/dashboard/patient`);
    revalidatePath(`/dashboard/patient/history`);
    return { success: true, assignment };
  } catch (error: any) {
    console.error("Assign questionnaire error:", error);
    return { success: false, error: error.message };
  }
}

export async function getPatientQuestionnaireAssignments(patientId: string) {
  try {
    const assignments = await prisma.questionnaireAssignment.findMany({
      where: { patientId },
      include: {
        questionnaire: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        responses: true,
      },
      orderBy: { dueDate: "desc" },
    });

    return { success: true, assignments };
  } catch (error: any) {
    console.error("Get patient questionnaires error:", error);
    return { success: false, error: error.message, assignments: [] };
  }
}

export async function getQuestionnaireAssignment(id: string) {
  try {
    const assignment = await prisma.questionnaireAssignment.findUnique({
      where: { id },
      include: {
        questionnaire: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        responses: true,
      },
    });

    return { success: true, assignment };
  } catch (error: any) {
    console.error("Get assignment error:", error);
    return { success: false, error: error.message };
  }
}

export async function getPendingQuestionnaireAssignments(patientId: string) {
  try {
    const assignments = await prisma.questionnaireAssignment.findMany({
      where: {
        patientId,
        status: "PENDING",
      },
      include: {
        questionnaire: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return { success: true, assignments };
  } catch (error: any) {
    console.error("Get pending questionnaires error:", error);
    return { success: false, error: error.message, assignments: [] };
  }
}

// ============================================
// QUESTIONNAIRE RESPONSES
// ============================================

export async function submitQuestionnaireResponses(
  assignmentId: string,
  responses: Array<{ questionId: string; answer: string }>
) {
  try {
    // Create responses
    await prisma.questionnaireResponse.createMany({
      data: responses.map((r) => ({
        assignmentId,
        questionId: r.questionId,
        answer: typeof r.answer === "string" ? r.answer : JSON.stringify(r.answer),
      })),
    });

    // Update assignment status
    const updatedAssignment = await prisma.questionnaireAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        questionnaire: {
          include: {
            questions: true,
          },
        },
        responses: true,
      },
    });

    revalidatePath(`/dashboard/patient`);
    revalidatePath(`/dashboard/patient/history`);
    return { success: true, assignment: updatedAssignment };
  } catch (error: any) {
    console.error("Submit responses error:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuestionnaireResponses(assignmentId: string) {
  try {
    const responses = await prisma.questionnaireResponse.findMany({
      where: { assignmentId },
    });

    return { success: true, responses };
  } catch (error: any) {
    console.error("Get responses error:", error);
    return { success: false, error: error.message, responses: [] };
  }
}

export async function getDoctorQuestionnaireResponses(doctorId: string) {
  try {
    const assignments = await prisma.questionnaireAssignment.findMany({
      where: {
        status: "COMPLETED",
        questionnaire: {
          createdBy: doctorId,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        questionnaire: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        responses: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return { success: true, assignments };
  } catch (error: any) {
    console.error("Get doctor questionnaire responses error:", error);
    return { success: false, error: error.message, assignments: [] };
  }
}

// ============================================
// PREDEFINED TEMPLATES
// ============================================

export async function initializePredefinedTemplates(doctorId: string) {
  try {
    const templates = [
      {
        title: "Post-Operative Evaluation — Week 1",
        description: "Evaluation of patient recovery after surgery in the first week",
        type: "POST_OP",
        questions: [
          {
            title: "How is your pain level today?",
            type: "RATING",
            minValue: 0,
            maxValue: 10,
            required: true,
          },
          {
            title: "Describe your pain location and type",
            type: "TEXTAREA",
            required: false,
          },
          {
            title: "Are you able to perform daily activities?",
            type: "YESNO",
            required: true,
          },
          {
            title: "Check any symptoms you're experiencing",
            type: "CHECKBOX",
            options: ["Redness", "Swelling", "Discharge", "Fever", "Other"],
            required: false,
          },
        ],
      },
      {
        title: "Weekly Symptom Tracking",
        description: "Track your symptoms throughout the week",
        type: "WEEKLY_ASSESSMENT",
        questions: [
          {
            title: "Rate your overall health this week (1-10)",
            type: "RATING",
            minValue: 1,
            maxValue: 10,
            required: true,
          },
          {
            title: "Did you experience any new symptoms?",
            type: "YESNO",
            required: true,
          },
          {
            title: "List all symptoms experienced",
            type: "TEXTAREA",
            required: false,
          },
          {
            title: "Were you able to take all your medications as prescribed?",
            type: "YESNO",
            required: true,
          },
        ],
      },
      {
        title: "Medication Adherence Check",
        description: "Verify patient is taking medications correctly",
        type: "MEDICATION_ADHERENCE",
        questions: [
          {
            title: "Have you taken your medications today?",
            type: "YESNO",
            required: true,
          },
          {
            title: "Rate your adherence this week (0-100%)",
            type: "RATING",
            minValue: 0,
            maxValue: 100,
            required: true,
          },
          {
            title: "Any side effects from medications?",
            type: "YESNO",
            required: true,
          },
          {
            title: "Describe any side effects",
            type: "TEXTAREA",
            required: false,
          },
        ],
      },
      {
        title: "Symptom Tracking (Pain & Fatigue)",
        description: "Daily tracking of pain and fatigue symptoms",
        type: "SYMPTOM_TRACKING",
        questions: [
          {
            title: "Current pain level (0-10)",
            type: "RATING",
            minValue: 0,
            maxValue: 10,
            required: true,
          },
          {
            title: "Current fatigue level (0-10)",
            type: "RATING",
            minValue: 0,
            maxValue: 10,
            required: true,
          },
          {
            title: "When did your pain start?",
            type: "DATE",
            required: false,
          },
          {
            title: "Pain locations",
            type: "CHECKBOX",
            options: ["Head", "Chest", "Abdomen", "Limbs", "Other"],
            required: false,
          },
        ],
      },
    ];

    const created = await Promise.all(
      templates.map((template) =>
        prisma.questionnaire.create({
          data: {
            title: template.title,
            description: template.description,
            type: template.type,
            createdBy: doctorId,
            questions: {
              create: template.questions.map((q, index) => ({
                order: index,
                title: q.title,
                description: q.description,
                type: q.type,
                options: q.options ? JSON.stringify(q.options) : null,
                required: q.required !== false,
                minValue: q.minValue,
                maxValue: q.maxValue,
              })),
            },
          },
        })
      )
    );

    return { success: true, templates: created };
  } catch (error: any) {
    console.error("Initialize templates error:", error);
    return { success: false, error: error.message };
  }
}
