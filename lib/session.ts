import { cookies } from "next/headers";
import type { UserRole } from "@/lib/auth-routes";
import { isUserRole, parseUserRole } from "@/lib/auth-routes";
import { DEMO_CLERK_IDS } from "@/lib/demo-users";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "farmfax_clerk_id";
const ROLE_COOKIE = "farmfax_role";

export interface DemoSession {
  clerkId: string;
  role: UserRole;
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const clerkId = cookieStore.get(SESSION_COOKIE)?.value;
  const roleRaw = cookieStore.get(ROLE_COOKIE)?.value;

  if (!clerkId || !roleRaw || !isUserRole(roleRaw)) {
    return null;
  }

  return { clerkId, role: roleRaw };
}

export async function setDemoSession(role: UserRole): Promise<void> {
  await setUserSession(DEMO_CLERK_IDS[role], role);
}

export async function setUserSession(
  clerkId: string,
  role: UserRole,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, clerkId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set(ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

export async function requireSession(
  expectedRole?: UserRole,
): Promise<{ session: DemoSession; user: User }> {
  const session = await getDemoSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (expectedRole && session.role !== expectedRole) {
    throw new Error("FORBIDDEN");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.clerkId },
  });

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return { session, user };
}

export function roleFromQuery(value: string | null | undefined): UserRole {
  return parseUserRole(value ?? undefined);
}
