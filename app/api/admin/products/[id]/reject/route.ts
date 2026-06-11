import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { rejectProduct } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { user } = await requireSession("admin");
    const { id } = await context.params;
    const body = (await request.json()) as { reason?: string };
    await rejectProduct(id, user.id, body.reason);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
