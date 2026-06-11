import { randomUUID } from "node:crypto";
import type { UserRole } from "@/lib/auth-routes";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { provisionUserProfile } from "@/lib/user-service";

const FARM_FOCUS_LABELS: Record<string, string> = {
  catfish: "Catfish",
  tilapia: "Tilapia",
  mixed: "Mixed aquaculture",
  other: "Other agriculture",
};

export interface RegisterFarmerInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  farmFocus: string;
}

export interface RegisterSupplierInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  warehouseAddress?: string;
}

export interface RegisterAdminInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  adminCode: string;
}

export interface AuthUserDto {
  clerkId: string;
  role: UserRole;
  email: string;
  fullName: string | null;
  displayName: string;
  profilePictureUrl: string | null;
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, "");
}

/** Removes half-created accounts from a prior failed signup attempt. */
async function clearIncompleteAccount(
  existing: { id: string; passwordHash: string | null },
): Promise<void> {
  if (!existing.passwordHash) {
    await prisma.user.delete({ where: { id: existing.id } });
  }
}

function assertNoRegisteredAccount(
  existing: { id: string; passwordHash: string | null } | null,
): void {
  if (!existing) return;
  if (!existing.passwordHash) return;
  throw new Error("An account with this email or phone already exists.");
}

export async function registerFarmer(
  input: RegisterFarmerInput,
): Promise<AuthUserDto> {
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phoneNumber: phone }] },
  });
  if (existing) {
    await clearIncompleteAccount(existing);
    assertNoRegisteredAccount(existing);
  }

  const clerkId = `clerk_farmer_${randomUUID()}`;
  const cropType = FARM_FOCUS_LABELS[input.farmFocus] ?? "Catfish";
  const passwordHash = await hashPassword(input.password);

  await provisionUserProfile(
    clerkId,
    email,
    phone,
    "FARMER",
    {
      farmName: input.fullName.trim(),
      farmSizeHectares: "1.00",
      primaryCropType: cropType,
      creditLimit: "500000.00",
      utilizedCredit: "0.00",
    },
    { fullName: input.fullName, passwordHash },
  );

  return {
    clerkId,
    role: "farmer",
    email,
    fullName: input.fullName.trim(),
    displayName: input.fullName.trim(),
    profilePictureUrl: null,
  };
}

export async function registerSupplier(
  input: RegisterSupplierInput,
): Promise<AuthUserDto> {
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone || `+234${Date.now().toString().slice(-10)}`);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phoneNumber: phone }] },
  });
  if (existing) {
    await clearIncompleteAccount(existing);
    assertNoRegisteredAccount(existing);
  }

  const businessTaken = await prisma.supplierProfile.findUnique({
    where: { businessName: input.businessName.trim() },
  });
  if (businessTaken) throw new Error("This business name is already registered.");

  const clerkId = `clerk_supplier_${randomUUID()}`;
  const passwordHash = await hashPassword(input.password);

  await provisionUserProfile(
    clerkId,
    email,
    phone,
    "SUPPLIER",
    {
      businessName: input.businessName.trim(),
      warehouseAddress:
        input.warehouseAddress?.trim() || "Address pending — update in profile",
      isVerified: false,
    },
    { fullName: input.fullName, passwordHash },
  );

  return {
    clerkId,
    role: "supplier",
    email,
    fullName: input.fullName.trim(),
    displayName: input.businessName.trim(),
    profilePictureUrl: null,
  };
}

export async function registerAdmin(
  input: RegisterAdminInput,
): Promise<AuthUserDto> {
  if (input.adminCode.trim() !== "FARMFAX-ADMIN") {
    throw new Error("Invalid admin access code.");
  }

  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone || `+2348${Date.now().toString().slice(-9)}`);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phoneNumber: phone }] },
  });
  if (existing) {
    await clearIncompleteAccount(existing);
    assertNoRegisteredAccount(existing);
  }

  const clerkId = `clerk_admin_${randomUUID()}`;
  const passwordHash = await hashPassword(input.password);

  await provisionUserProfile(clerkId, email, phone, "ADMIN", null, {
    fullName: input.fullName,
    passwordHash,
  });

  return {
    clerkId,
    role: "admin",
    email,
    fullName: input.fullName.trim(),
    displayName: input.fullName.trim(),
    profilePictureUrl: null,
  };
}

export async function authenticateUser(
  email: string,
  password: string,
  expectedRole: UserRole,
): Promise<AuthUserDto> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { farmerProfile: true, supplierProfile: true },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.passwordHash) {
    throw new Error(
      "This account is incomplete. Please sign up again or contact support.",
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password.");

  const role = user.role.toLowerCase() as UserRole;
  if (role !== expectedRole) {
    throw new Error(`This account is registered as a ${role}, not ${expectedRole}.`);
  }

  let displayName = user.fullName ?? user.email;
  if (user.farmerProfile) displayName = user.farmerProfile.farmName;
  if (user.supplierProfile) displayName = user.supplierProfile.businessName;

  return {
    clerkId: user.clerkId,
    role,
    email: user.email,
    fullName: user.fullName,
    displayName,
    profilePictureUrl: user.profilePictureUrl,
  };
}

export async function getAuthUser(clerkId: string): Promise<AuthUserDto | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { farmerProfile: true, supplierProfile: true },
  });
  if (!user) return null;

  const role = user.role.toLowerCase() as UserRole;
  let displayName = user.fullName ?? user.email;
  if (user.farmerProfile) displayName = user.farmerProfile.farmName;
  if (user.supplierProfile) displayName = user.supplierProfile.businessName;
  if (user.role === "ADMIN") {
    displayName = user.fullName ?? "FarmFax Operations";
  }

  return {
    clerkId: user.clerkId,
    role,
    email: user.email,
    fullName: user.fullName,
    displayName,
    profilePictureUrl: user.profilePictureUrl,
  };
}

export async function changePassword(
  clerkId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user?.passwordHash) {
    throw new Error("Account not found or password not set.");
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Current password is incorrect.");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { clerkId },
    data: { passwordHash },
  });
}
