import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getFarmerProfile, updateFarmerProfile } from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const profile = await getFarmerProfile(user.id);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const body = (await request.json()) as {
      fullName?: string;
      farmName?: string;
      farmSizeHectares?: string;
      primaryCropType?: string;
      phoneNumber?: string;
    };
    const profile = await updateFarmerProfile(user.id, body);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
