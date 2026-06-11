import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth-routes";
import { isUserRole } from "@/lib/auth-routes";
import { authenticateUser } from "@/lib/auth-service";
import {
  sanitizeText,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { clearDemoSession, setUserSession } from "@/lib/session";

interface SessionBody {
  role?: string;
  action?: "logout";
  email?: string;
  password?: string;
}

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(key: string): void {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT) {
    throw new Error("Too many attempts. Please wait a minute and try again.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    checkRateLimit(ip);

    const body = (await request.json()) as SessionBody;

    if (body.action === "logout") {
      await clearDemoSession();
      return jsonOk({ ok: true });
    }

    if (!body.role || !isUserRole(body.role)) {
      return jsonError(new Error("Invalid role"), 400);
    }

    const email = sanitizeText(body.email ?? "", 254);
    const password = body.password ?? "";

    const emailError = validateEmail(email);
    if (emailError) return jsonError(new Error(emailError), 400);

    const passwordError = validatePassword(password, false);
    if (passwordError) return jsonError(new Error(passwordError), 400);

    const authUser = await authenticateUser(
      email,
      password,
      body.role as UserRole,
    );
    await setUserSession(authUser.clerkId, authUser.role);
    return jsonOk({ ok: true, role: authUser.role, user: authUser });
  } catch (error) {
    return jsonError(error);
  }
}
