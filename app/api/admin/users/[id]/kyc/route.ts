import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { updateUserKyc } from "@/lib/platform-workflow";
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
    const body = (await request.json()) as {
      kycStatus?: "VERIFIED" | "REJECTED" | "PENDING" | "UNVERIFIED";
    };
    if (!body.kycStatus) throw new Error("kycStatus is required.");
    await updateUserKyc(id, body.kycStatus, user.id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
