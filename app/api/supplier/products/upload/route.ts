import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { saveUploadedImage } from "@/lib/image-upload";
import { requireSession } from "@/lib/session";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireSession("supplier");

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return jsonError(new Error("Image file is required."), 400);
    }

    const url = await saveUploadedImage(file, "products");
    return jsonOk({ url });
  } catch (error) {
    return jsonError(error);
  }
}
