import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveFile(file: File): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  const dir = path.join(UPLOAD_DIR, year, month);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const ext = path.extname(file.name) || ".bin";
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${year}/${month}/${filename}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const filepath = path.join(process.cwd(), "public", fileUrl);
  try {
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch {
    console.error(`Failed to delete file: ${filepath}`);
  }
}

export function getAcceptedTypes(): string {
  return "video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif";
}

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  if (!isVideo && !isImage) {
    return { valid: false, error: "Only video and image files are accepted" };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: "Video files must be under 500MB" };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: "Image files must be under 10MB" };
  }

  return { valid: true };
}
