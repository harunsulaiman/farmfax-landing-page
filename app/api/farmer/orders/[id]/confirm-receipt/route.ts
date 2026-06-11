import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { confirmOrderReceipt } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const { id } = await params;
    const order = await confirmOrderReceipt(id, user.id);
    return jsonOk({ order });
  } catch (error) {
    return jsonError(error);
  }
}
