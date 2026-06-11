import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-service";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { session } = await requireSession();
    const user = await getAuthUser(session.clerkId);
    if (!user) return jsonError(new Error("UNAUTHORIZED"), 401);
    return jsonOk({ user });
  } catch (error) {
    return jsonError(error);
  }
}
