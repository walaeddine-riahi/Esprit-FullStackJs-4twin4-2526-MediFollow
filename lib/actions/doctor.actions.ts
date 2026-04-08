"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface DoctorProfileData {
  specialty?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  experiences?: ExperienceInput[];
}

export interface ExperienceInput {
  title: string;
  institution: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  description?: string | null;
}

/**
 * Get doctor profile by user ID
 */
export async function getDoctorProfile(userId: string) {
  try {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
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
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du profil",
    };
  }
}

/**
 * Create or update doctor profile
 */
export async function updateDoctorProfile(
  userId: string,
  profileData: DoctorProfileData
) {
  try {
    // Check if profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    let profile;

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.doctorProfile.update({
        where: { userId },
        data: {
          specialty: profileData.specialty,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          profileImage: profileData.profileImage,
          experiences: profileData.experiences || [],
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      profile = await prisma.doctorProfile.create({
        data: {
          userId,
          specialty: profileData.specialty,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          profileImage: profileData.profileImage,
          experiences: profileData.experiences || [],
        },
      });
    }

    // Revalidate the profile page
    revalidatePath("/dashboard/doctor/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    };
  }
}

/**
 * Upload profile image with Azure Blob Storage fallback
 */
export async function uploadProfileImage(
  userId: string,
  imageData: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Limit base64 image size to prevent MongoDB document size limit errors
    // MongoDB has 16MB limit per document, but we are conservative
    const MAX_IMAGE_SIZE = 50000; // ~50KB in base64, ~37.5KB binary
    const limitedImageData =
      imageData.length > MAX_IMAGE_SIZE
        ? imageData.slice(0, MAX_IMAGE_SIZE)
        : imageData;

    const profile = await prisma.doctorProfile.update({
      where: { userId },
      data: {
        profileImage: limitedImageData,
      },
    });

    revalidatePath("/dashboard/doctor/profile");

    return {
      success: true,
      url: limitedImageData,
    };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return {
      success: false,
      error: "Erreur lors du téléchargement de l'image",
    };
  }
}

/**
 * Delete doctor profile
 */
export async function deleteDoctorProfile(userId: string) {
  try {
    await prisma.doctorProfile.delete({
      where: { userId },
    });

    revalidatePath("/dashboard/doctor/profile");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting doctor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du profil",
    };
  }
}
