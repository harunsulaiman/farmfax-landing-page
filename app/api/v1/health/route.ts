import { NextRequest, NextResponse } from "next/server";
import { verifyRole } from "@/lib/security-middleware";

/**
 * Health probe — demonstrates RBAC-gated API route pattern.
 * Accessible to all authenticated platform roles.
 */
export async function GET(request: NextRequest) {
  const verification = await verifyRole(request, [
    "ADMIN",
    "SUPPLIER",
    "FARMER",
  ]);

  if (!verification.authorized) {
    return verification.response;
  }

  return NextResponse.json({
    status: "ok",
    service: "farmfax-api-v1",
    role: verification.user.role,
  });
}
