import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function saveUploadedImage(
  file: File,
  subfolder: "products" | "avatars",
): Promise<string> {
  if (!IMAGE_ALLOWED.has(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("Image must be 2MB or smaller.");
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${subfolder}/${filename}`;
}
