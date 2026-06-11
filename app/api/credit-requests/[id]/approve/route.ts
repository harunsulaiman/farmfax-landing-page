import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { approveCreditRequest } from "@/lib/order-workflow";
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
    const approved = await approveCreditRequest(id, user);
    return jsonOk({ request: approved });
  } catch (error) {
    return jsonError(error);
  }
}
