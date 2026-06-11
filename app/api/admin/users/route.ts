import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { listUsersForAdmin } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    await requireSession("admin");
    const users = await listUsersForAdmin();
    return jsonOk({ users });
  } catch (error) {
    return jsonError(error);
  }
}
