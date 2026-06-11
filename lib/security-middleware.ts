import { NextRequest, NextResponse } from "next/server";
import type { KycStatus, User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Canonical role union enforced at the API edge — mirrors Prisma UserRole enum. */
export type AllowedRole = "ADMIN" | "SUPPLIER" | "FARMER";

/** Subset of User fields returned after successful authorization. */
export type AuthenticatedUser = Pick<
  User,
  "id" | "clerkId" | "email" | "role" | "kycStatus"
>;

export interface RoleVerificationSuccess {
  authorized: true;
  user: AuthenticatedUser;
}

export interface RoleVerificationFailure {
  authorized: false;
  response: NextResponse;
}

export type RoleVerificationResult =
  | RoleVerificationSuccess
  | RoleVerificationFailure;

interface JwtPayload {
  sub?: string;
}

const FORBIDDEN_MESSAGE =
  "Cross-tenant access denied: insufficient role privileges for this operation";

/**
 * Role enforcement block — constructs a structured 403 JSON payload.
 * Used when horizontal privilege escalation is detected (wrong role for route).
 */
function forbiddenResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: "Forbidden",
      message,
    },
    { status: 403 },
  );
}

function unauthorizedResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: "Unauthorized",
      message,
    },
    { status: 401 },
  );
}

/**
 * Extracts the Clerk subject identifier from a Bearer JWT.
 *
 * Production note: signature verification must be performed via the Clerk
 * backend SDK before trusting the payload. This decode step mimics the
 * token-processing pipeline for Phase 1 API route integration.
 */
function extractClerkIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  const segments = token.split(".");

  if (segments.length < 2) {
    return null;
  }

  const payloadSegment = segments[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadSegment, "base64url").toString("utf-8"),
    ) as JwtPayload;

    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function isAllowedRole(role: UserRole, allowedRoles: AllowedRole[]): boolean {
  return allowedRoles.includes(role as AllowedRole);
}

/**
 * RBAC access validation matrix for serverless Next.js API routes.
 *
 * Processing pipeline:
 *  1. Extract and decode authentication token from Authorization header.
 *  2. Resolve the verified database profile by clerkId (source of truth for roles).
 *  3. Terminate with 403 if the user's role is not in the allowed set.
 *
 * @param request      Incoming Next.js API request (App Router Route Handler).
 * @param allowedRoles Role whitelist for the target endpoint.
 */
export async function verifyRole(
  request: NextRequest,
  allowedRoles: AllowedRole[],
): Promise<RoleVerificationResult> {
  if (allowedRoles.length === 0) {
    return {
      authorized: false,
      response: forbiddenResponse("No roles configured for this endpoint"),
    };
  }

  const clerkId = extractClerkIdFromToken(request);

  if (!clerkId) {
    return {
      authorized: false,
      response: unauthorizedResponse("Missing or invalid authentication token"),
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      role: true,
      kycStatus: true,
    },
  });

  if (!user) {
    return {
      authorized: false,
      response: forbiddenResponse(
        "User profile not found in authorization registry",
      ),
    };
  }

  if (!isAllowedRole(user.role, allowedRoles)) {
    return {
      authorized: false,
      response: forbiddenResponse(FORBIDDEN_MESSAGE),
    };
  }

  return {
    authorized: true,
    user: user as AuthenticatedUser,
  };
}

/**
 * Horizontal privilege escalation guard — ensures a non-admin caller can only
 * act on resources they own (matched by profile ID).
 *
 * ADMIN role bypasses ownership checks (cross-tenant oversight capability).
 */
export function verifyResourceOwnership(
  user: AuthenticatedUser,
  resourceOwnerId: string,
  resourceLabel: string,
): RoleVerificationFailure | null {
  if (user.role === "ADMIN") {
    return null;
  }

  if (user.id !== resourceOwnerId) {
    return {
      authorized: false,
      response: forbiddenResponse(
        `Cross-tenant access denied: ${resourceLabel} belongs to another account`,
      ),
    };
  }

  return null;
}

export type { KycStatus, UserRole };
