import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { approveProduct } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { user } = await requireSession("admin");
    const { id } = await context.params;
    const product = await approveProduct(id, user.id);
    return jsonOk({ product });
  } catch (error) {
    return jsonError(error);
  }
}
