import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { rejectCreditRequest } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface RejectBody {
  reason?: string;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { user } = await requireSession("admin");
    const { id } = await context.params;
    const body = (await request.json()) as RejectBody;
    const rejected = await rejectCreditRequest(id, user, body.reason);
    return jsonOk({ request: rejected });
  } catch (error) {
    return jsonError(error);
  }
}
