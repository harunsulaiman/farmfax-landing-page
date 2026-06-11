import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import {
  createSupplierProduct,
  listSupplierProducts,
} from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const products = await listSupplierProducts(user.id);
    return jsonOk({ products });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      category?: string;
      unitPrice?: string;
      quantityInStock?: number;
      sku?: string;
      imageUrl?: string;
      imageUrls?: string[];
    };

    if (!body.name?.trim() || !body.category?.trim() || !body.unitPrice) {
      throw new Error("Name, category, and price are required.");
    }

    const product = await createSupplierProduct(user.id, {
      name: body.name,
      description: body.description,
      category: body.category,
      unitPrice: body.unitPrice,
      quantityInStock: body.quantityInStock ?? 0,
      sku: body.sku,
      imageUrl: body.imageUrl,
      imageUrls: body.imageUrls,
    });

    return jsonOk({ product }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
