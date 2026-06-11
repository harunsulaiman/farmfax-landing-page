import { NextResponse } from "next/server";
import { isUserRole, type UserRole } from "@/lib/auth-routes";
import { authenticateUser } from "@/lib/auth-service";
import { sanitizeText, validateEmail, validatePassword } from "@/lib/auth-validation";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { setUserSession } from "@/lib/session";

interface LoginBody {
  role?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginBody;

    if (!body.role || !isUserRole(body.role)) {
      return jsonError(new Error("Invalid role"), 400);
    }

    const emailError = validateEmail(body.email ?? "");
    if (emailError) return jsonError(new Error(emailError), 400);

    const passwordError = validatePassword(body.password ?? "");
    if (passwordError) return jsonError(new Error(passwordError), 400);

    const authUser = await authenticateUser(
      sanitizeText(body.email!, 254),
      body.password!,
      body.role as UserRole,
    );

    await setUserSession(authUser.clerkId, authUser.role);

    return jsonOk({ user: authUser });
  } catch (error) {
    console.error("[auth/login]", error);
    return jsonError(error, 401);
  }
}
