import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getSupplierSummary } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const summary = await getSupplierSummary(user.id);
    return jsonOk({ summary });
  } catch (error) {
    return jsonError(error);
  }
}
