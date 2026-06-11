import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { saveUploadedImage } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession();

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return jsonError(new Error("Image file is required."), 400);
    }

    const url = await saveUploadedImage(file, "avatars");

    await prisma.user.update({
      where: { id: user.id },
      data: { profilePictureUrl: url },
    });

    return jsonOk({ url });
  } catch (error) {
    return jsonError(error);
  }
}
