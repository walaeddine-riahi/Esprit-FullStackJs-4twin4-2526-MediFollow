/**
 * Convert Azure Blob URL to our proxy download URL
 */
export function getBlobDownloadUrl(blobUrl: string, fileName: string): string {
  if (!blobUrl) return "";

  // Extract the blob path from the full Azure URL
  // URL format: https://{account}.blob.core.windows.net/{container}/{path}
  try {
    const url = new URL(blobUrl);
    const pathname = url.pathname;
    // pathname is like: /uploads/medical-documents/...
    const blobPath = pathname.substring(1); // Remove leading /

    // Split into container and path
    const parts = blobPath.split("/");
    const containerAndPath = parts.slice(1).join("/"); // Skip container, join rest

    // Return proxy URL
    return `/api/download/${containerAndPath}?fileName=${encodeURIComponent(fileName)}`;
  } catch (error) {
    console.error("Invalid blob URL:", blobUrl);
    return "";
  }
}
