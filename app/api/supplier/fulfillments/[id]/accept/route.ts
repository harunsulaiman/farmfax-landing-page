import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { acceptFulfillment } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const { id } = await params;
    await acceptFulfillment(id, user.id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
