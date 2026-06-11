import { NextResponse } from "next/server";
import { changePassword } from "@/lib/auth-service";
import { validatePassword } from "@/lib/auth-validation";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { requireSession } from "@/lib/session";

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { session } = await requireSession();
    const body = (await request.json()) as ChangePasswordBody;

    if (!body.currentPassword?.trim()) {
      return jsonError(new Error("Current password is required."), 400);
    }

    const passwordError = validatePassword(body.newPassword ?? "", true);
    if (passwordError) {
      return jsonError(new Error(passwordError), 400);
    }

    if (body.currentPassword === body.newPassword) {
      return jsonError(
        new Error("New password must be different from your current password."),
        400,
      );
    }

    await changePassword(
      session.clerkId,
      body.currentPassword,
      body.newPassword!,
    );

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("[auth/change-password]", error);
    return jsonError(error);
  }
}
