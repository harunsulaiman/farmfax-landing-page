import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { listCatalogProducts } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    await requireSession();
    const products = await listCatalogProducts();
    return jsonOk({ products });
  } catch (error) {
    return jsonError(error);
  }
}
