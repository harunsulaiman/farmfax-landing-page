import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/farmer/dashboard",
  "/supplier/dashboard",
  "/admin/dashboard",
] as const;

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const clerkId = request.cookies.get("farmfax_clerk_id")?.value;
  const role = request.cookies.get("farmfax_role")?.value;

  if (!clerkId || !role) {
    if (pathname.startsWith("/farmer")) {
      return NextResponse.redirect(new URL("/farmer/login", request.url));
    }
    if (pathname.startsWith("/supplier")) {
      return NextResponse.redirect(new URL("/supplier/login", request.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/farmer") && role !== "farmer") {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  if (pathname.startsWith("/supplier") && role !== "supplier") {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/farmer/dashboard/:path*",
    "/supplier/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
