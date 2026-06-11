import { NextResponse } from "next/server";
import { isSignupRole } from "@/lib/auth-routes";
import { registerFarmer, registerSupplier } from "@/lib/auth-service";
import {
  sanitizeText,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/auth-validation";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { setUserSession } from "@/lib/session";

interface RegisterBody {
  role?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  businessName?: string;
  warehouseAddress?: string;
  farmFocus?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RegisterBody;

    if (!body.role || !isSignupRole(body.role)) {
      return jsonError(
        new Error("Invalid role. Only farmer and supplier accounts can be created here."),
        400,
      );
    }

    const emailError = validateEmail(body.email ?? "");
    if (emailError) return jsonError(new Error(emailError), 400);

    const passwordError = validatePassword(body.password ?? "", true);
    if (passwordError) return jsonError(new Error(passwordError), 400);

    const nameError = validateName(body.fullName ?? "", "Full name");
    if (nameError) return jsonError(new Error(nameError), 400);

    let authUser;

    if (body.role === "farmer") {
      const phoneError = validatePhone(body.phone ?? "");
      if (phoneError) return jsonError(new Error(phoneError), 400);

      authUser = await registerFarmer({
        fullName: sanitizeText(body.fullName!, 120),
        email: body.email!,
        phone: body.phone!,
        password: body.password!,
        farmFocus: body.farmFocus ?? "catfish",
      });
    } else if (body.role === "supplier") {
      if (!body.businessName?.trim()) {
        return jsonError(new Error("Business name is required."), 400);
      }
      if (body.phone?.trim()) {
        const phoneError = validatePhone(body.phone);
        if (phoneError) return jsonError(new Error(phoneError), 400);
      }

      authUser = await registerSupplier({
        fullName: sanitizeText(body.fullName!, 120),
        email: body.email!,
        phone: body.phone ?? "",
        password: body.password!,
        businessName: sanitizeText(body.businessName, 200),
        warehouseAddress: body.warehouseAddress
          ? sanitizeText(body.warehouseAddress, 500)
          : undefined,
      });
    } else {
      return jsonError(new Error("Invalid role."), 400);
    }

    await setUserSession(authUser.clerkId, authUser.role);

    return jsonOk({ user: authUser }, 201);
  } catch (error) {
    console.error("[auth/register]", error);
    return jsonError(error);
  }
}
