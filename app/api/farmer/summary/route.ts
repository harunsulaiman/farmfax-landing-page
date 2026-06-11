import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getFarmerSummary } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const summary = await getFarmerSummary(user.id);
    return jsonOk({ summary });
  } catch (error) {
    return jsonError(error);
  }
}
