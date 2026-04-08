import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { getCurrentUser } from "@/lib/actions/auth.actions";

/**
 * GET /api/download/[...path]?fileName=name
 * Generate a SAS URL for downloading files from Azure Blob Storage
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string[] } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the blob path from URL - reconstruct from segments
    const blobPath = params.documentId.join("/");
    const fileName = request.nextUrl.searchParams.get("fileName") || "download";

    if (!blobPath) {
      return NextResponse.json(
        { error: "No blob path provided" },
        { status: 400 }
      );
    }

    // Get Azure Storage configuration
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

    if (!connectionString) {
      return NextResponse.json(
        { error: "Azure Storage configuration missing" },
        { status: 500 }
      );
    }

    // Create BlobServiceClient
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Check if blob exists
    try {
      await blockBlobClient.getProperties();
    } catch (error) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Generate SAS URL (valid for 1 hour)
    const sasUrl = await blockBlobClient.generateSasUrl({
      protocol: "https",
      startsOn: new Date(),
      expiresOn: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour
      permissions: "r", // read only
    });

    // Return 302 redirect to SAS URL
    return NextResponse.redirect(sasUrl, { status: 302 });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate download URL",
      },
      { status: 500 }
    );
  }
}
