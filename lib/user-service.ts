import {
  Prisma,
  type FarmerProfile,
  type SupplierProfile,
  type User,
  type UserRole,
} from "@prisma/client";
import { prisma } from "./prisma";

/** Pipeline role literals — mirrors Prisma UserRole enum at the API boundary. */
export type ProvisionRole = "ADMIN" | "SUPPLIER" | "FARMER";

/** Farmer sub-profile payload; monetary fields use string decimals for Prisma.Decimal. */
export interface FarmerProfileProvisionData {
  farmName: string;
  farmSizeHectares: string;
  primaryCropType: string;
  creditLimit?: string;
  utilizedCredit?: string;
}

/** Supplier sub-profile payload. */
export interface SupplierProfileProvisionData {
  businessName: string;
  tin?: string | null;
  warehouseAddress: string;
  isVerified?: boolean;
}

/** Strict role-to-profile map — ADMIN has no sub-profile row. */
export type RoleProfileDataMap = {
  ADMIN: null | undefined;
  FARMER: FarmerProfileProvisionData;
  SUPPLIER: SupplierProfileProvisionData;
};

export type ProfileDataForRole<R extends ProvisionRole> = RoleProfileDataMap[R];

/** Optional auth fields stored on the User row at creation time. */
export interface UserAuthProvisionData {
  fullName?: string;
  passwordHash?: string;
}

/** User row returned after atomic provisioning, including nested sub-profiles. */
export type ProvisionedUserResult = User & {
  farmerProfile: FarmerProfile | null;
  supplierProfile: SupplierProfile | null;
};

function validateProfilePayload<R extends ProvisionRole>(
  role: R,
  profileData: ProfileDataForRole<R>,
): void {
  if (role === "ADMIN") {
    if (profileData !== null && profileData !== undefined) {
      throw new Error(
        "[provisionUserProfile] ADMIN role must not include sub-profile data",
      );
    }
    return;
  }

  if (profileData === null || profileData === undefined) {
    throw new Error(
      `[provisionUserProfile] ${role} role requires sub-profile data`,
    );
  }
}

function toDecimal(value: string, fieldLabel: string): Prisma.Decimal {
  if (value.trim() === "") {
    throw new Error(
      `[provisionUserProfile] ${fieldLabel} must be a non-empty decimal string`,
    );
  }
  return new Prisma.Decimal(value);
}

/**
 * Atomically provisions a User and optional role sub-profile (Farmer or Supplier)
 * inside a single Prisma transaction. Any failure rolls back the entire operation.
 */
export async function provisionUserProfile<R extends ProvisionRole>(
  clerkId: string,
  email: string,
  phoneNumber: string,
  role: R,
  profileData: ProfileDataForRole<R>,
  authData?: UserAuthProvisionData,
): Promise<ProvisionedUserResult> {
  validateProfilePayload(role, profileData);

  const prismaRole = role as UserRole;

  console.log(
    `[provisionUserProfile] Transaction trigger — clerkId=${clerkId}, role=${role}, email=${email}`,
  );

  try {
    const provisioned = await prisma.$transaction(async (tx) => {
      console.log(
        `[provisionUserProfile] Step 1/2 — creating base User record (role=${role})`,
      );

      const user = await tx.user.create({
        data: {
          clerkId,
          email,
          phoneNumber,
          role: prismaRole,
          ...(authData?.fullName?.trim()
            ? { fullName: authData.fullName.trim() }
            : {}),
          ...(authData?.passwordHash
            ? { passwordHash: authData.passwordHash }
            : {}),
        },
      });

      console.log(
        `[provisionUserProfile] User created — userId=${user.id}, proceeding to sub-profile`,
      );

      if (role === "FARMER") {
        const farmerData = profileData as FarmerProfileProvisionData;
        console.log(
          `[provisionUserProfile] Step 2/2 — creating FarmerProfile for userId=${user.id}`,
        );

        await tx.farmerProfile.create({
          data: {
            userId: user.id,
            farmName: farmerData.farmName,
            farmSizeHectares: toDecimal(
              farmerData.farmSizeHectares,
              "farmSizeHectares",
            ),
            primaryCropType: farmerData.primaryCropType,
            creditLimit: toDecimal(
              farmerData.creditLimit ?? "0.00",
              "creditLimit",
            ),
            utilizedCredit: toDecimal(
              farmerData.utilizedCredit ?? "0.00",
              "utilizedCredit",
            ),
          },
        });
      } else if (role === "SUPPLIER") {
        const supplierData = profileData as SupplierProfileProvisionData;
        console.log(
          `[provisionUserProfile] Step 2/2 — creating SupplierProfile for userId=${user.id}`,
        );

        await tx.supplierProfile.create({
          data: {
            userId: user.id,
            businessName: supplierData.businessName,
            tin: supplierData.tin ?? null,
            warehouseAddress: supplierData.warehouseAddress,
            isVerified: supplierData.isVerified ?? false,
          },
        });
      } else {
        console.log(
          `[provisionUserProfile] Step 2/2 — skipped (ADMIN has no sub-profile)`,
        );
      }

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          farmerProfile: true,
          supplierProfile: true,
        },
      });
    });

    console.log(
      `[provisionUserProfile] Transaction committed — userId=${provisioned.id}, role=${provisioned.role}`,
    );

    return provisioned;
  } catch (error) {
    console.error(
      `[provisionUserProfile] Transaction aborted — all changes rolled back for clerkId=${clerkId}`,
      error,
    );
    throw error;
  }
}
