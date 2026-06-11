import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import {
  listAllProductsForAdmin,
  listPendingProductsForAdmin,
} from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    await requireSession("admin");
    const [pending, all] = await Promise.all([
      listPendingProductsForAdmin(),
      listAllProductsForAdmin(),
    ]);
    return jsonOk({ pending, all });
  } catch (error) {
    return jsonError(error);
  }
}
