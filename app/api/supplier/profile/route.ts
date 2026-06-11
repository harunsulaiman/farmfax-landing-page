import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getSupplierProfile, updateSupplierProfile } from "@/lib/platform-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const profile = await getSupplierProfile(user.id);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const body = (await request.json()) as {
      fullName?: string;
      businessName?: string;
      tin?: string;
      warehouseAddress?: string;
      phoneNumber?: string;
    };
    const profile = await updateSupplierProfile(user.id, body);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
