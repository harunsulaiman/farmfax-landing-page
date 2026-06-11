import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { markFulfillmentFulfilled } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const { id } = await context.params;
    await markFulfillmentFulfilled(id, user.id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
