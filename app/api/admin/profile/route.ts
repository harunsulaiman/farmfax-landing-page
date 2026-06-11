import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getAdminProfile } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("admin");
    const profile = await getAdminProfile(user.id);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
