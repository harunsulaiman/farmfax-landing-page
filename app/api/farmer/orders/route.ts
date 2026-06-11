import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { listOrdersForFarmer } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const data = await listOrdersForFarmer(user.id);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
