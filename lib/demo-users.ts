import type { UserRole } from "@/lib/auth-routes";

export const DEMO_CLERK_IDS: Record<UserRole, string> = {
  farmer: "clerk_demo_farmer_001",
  supplier: "clerk_demo_supplier_001",
  admin: "clerk_demo_admin_001",
} as const;

export const DEMO_DISPLAY_NAMES: Record<UserRole, string> = {
  farmer: "Abdullahi Umaru",
  supplier: "Chidi Okafor",
  admin: "Operations Team",
} as const;
