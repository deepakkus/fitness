// /lib/storage.ts
import { mkdir, stat } from "fs/promises";
import mime from "mime";

// Utility function to ensure directory exists or create it
export async function ensureDirExists(uploadDir: string) {
  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error("Error creating directory", e);
      throw new Error("Error creating directory");
    }
  }
}

// Helper function to generate a unique filename
export function generateFilename(file: File) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const extension = mime.getExtension(file.type) || "jpg"; // Default to jpg if extension is undefined
  const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove original extension
  return `${baseName}-${uniqueSuffix}.${extension}`;
}
