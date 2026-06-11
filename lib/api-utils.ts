import { NextResponse } from "next/server";
import { toUserFacingError } from "@/lib/api-errors";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown, status = 400): NextResponse {
  const message = toUserFacingError(error);
  let resolvedStatus = status;

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") resolvedStatus = 401;
    if (error.message === "FORBIDDEN") resolvedStatus = 403;
  }

  return NextResponse.json({ error: message }, { status: resolvedStatus });
}
