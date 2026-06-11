export type UserRole = "farmer" | "supplier" | "admin";

/** Roles that can self-register through the public signup flow. */
export type SignupRole = "farmer" | "supplier";

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  farmer: "/farmer/dashboard",
  supplier: "/supplier/dashboard",
  admin: "/admin/dashboard",
} as const;

export const AUTH_LOGIN_PATHS: Record<UserRole, string> = {
  farmer: "/farmer/login",
  supplier: "/supplier/login",
  admin: "/admin/login",
} as const;

export const AUTH_SIGNUP_PATHS: Record<SignupRole, string> = {
  farmer: "/farmer/signup",
  supplier: "/supplier/signup",
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: "Farmer",
  supplier: "Supplier",
  admin: "Admin",
} as const;

const VALID_ROLES: readonly UserRole[] = ["farmer", "supplier", "admin"];
const SIGNUP_ROLES: readonly SignupRole[] = ["farmer", "supplier"];

export function isUserRole(value: string): value is UserRole {
  return (VALID_ROLES as readonly string[]).includes(value);
}

export function isSignupRole(value: string): value is SignupRole {
  return (SIGNUP_ROLES as readonly string[]).includes(value);
}

export function parseUserRole(value: string | null | undefined): UserRole {
  if (value && isUserRole(value)) {
    return value;
  }
  return "farmer";
}

export function parseSignupRole(value: string | null | undefined): SignupRole {
  if (value && isSignupRole(value)) {
    return value;
  }
  return "farmer";
}

export function getDashboardPath(role: UserRole): string {
  return DASHBOARD_PATHS[role];
}

export function getLoginPath(role: UserRole): string {
  return AUTH_LOGIN_PATHS[role];
}

export function getSignupPath(role: SignupRole): string {
  return AUTH_SIGNUP_PATHS[role];
}
