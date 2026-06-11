import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getAdminSummary } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    await requireSession("admin");
    const summary = await getAdminSummary();
    return jsonOk({ summary });
  } catch (error) {
    return jsonError(error);
  }
}
