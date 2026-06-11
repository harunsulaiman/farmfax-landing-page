import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { repayCreditRequest } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const body = (await request.json()) as { requestId?: string };
    if (!body.requestId?.trim()) {
      throw new Error("requestId is required.");
    }
    const loan = await repayCreditRequest(user.id, body.requestId.trim());
    return jsonOk({ loan });
  } catch (error) {
    return jsonError(error);
  }
}
