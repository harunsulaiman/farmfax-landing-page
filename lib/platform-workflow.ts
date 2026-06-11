import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface SupplierCatalogItemDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sku: string;
  unitPrice: string;
  quantityInStock: number;
  imageUrl: string | null;
  imageUrls: string[];
  isActive: boolean;
  approvalStatus: "approved" | "pending";
  unitsSold: number;
  revenue: string;
}

export interface SupplierSummaryDto {
  businessName: string;
  isVerified: boolean;
  activeProducts: number;
  pendingProducts: number;
  approvedOrders: number;
  pendingFulfillment: number;
  fulfilledOrders: number;
  acceptedOrders: number;
  totalSalesRevenue: string;
  unitsSold: number;
}

export interface SupplierProfileDto {
  email: string;
  phoneNumber: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  kycStatus: string;
  businessName: string;
  tin: string | null;
  warehouseAddress: string;
  isVerified: boolean;
}

export interface AdminProfileDto {
  email: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
  kycStatus: string;
  displayName: string;
  pendingOrders: number;
  pendingProducts: number;
  totalUsers: number;
}

export interface AdminSummaryDto {
  pendingOrders: number;
  totalOrders: number;
  pendingProducts: number;
  activeProducts: number;
  farmers: number;
  suppliers: number;
  verifiedSuppliers: number;
  totalCreditOutstanding: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  phoneNumber: string;
  role: string;
  kycStatus: string;
  displayName: string;
  isVerified: boolean | null;
  supplierProfileId: string | null;
  farmerProfileId: string | null;
}

async function notifyUser(
  userId: string,
  title: string,
  body: string,
  type: string,
  creditRequestId?: string,
): Promise<void> {
  await prisma.notification.create({
    data: { userId, title, body, type, creditRequestId },
  });
}

async function notifyAdmins(
  title: string,
  body: string,
  type: string,
): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) => notifyUser(admin.id, title, body, type)),
  );
}

interface CatalogSalesRow {
  unitsSold: number;
  revenue: Prisma.Decimal;
}

async function getCatalogSalesByItem(
  supplierId: string,
): Promise<Map<string, CatalogSalesRow>> {
  const rows = await prisma.creditRequestItem.findMany({
    where: {
      catalogItem: { supplierId },
      creditRequest: {
        fulfillment: { status: "FULFILLED" },
      },
    },
    select: {
      catalogItemId: true,
      quantity: true,
      unitPriceAtOrder: true,
    },
  });

  const map = new Map<string, CatalogSalesRow>();
  for (const row of rows) {
    const existing = map.get(row.catalogItemId) ?? {
      unitsSold: 0,
      revenue: new Prisma.Decimal(0),
    };
    existing.unitsSold += row.quantity;
    existing.revenue = existing.revenue.add(
      row.unitPriceAtOrder.mul(row.quantity),
    );
    map.set(row.catalogItemId, existing);
  }
  return map;
}

function mapCatalogItem(
  item: {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    sku: string;
    unitPrice: Prisma.Decimal;
    quantityInStock: number;
    imageUrl?: string | null;
    imageUrls?: string[];
    isActive: boolean;
  },
  sales?: CatalogSalesRow,
): SupplierCatalogItemDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    category: item.category,
    sku: item.sku,
    unitPrice: item.unitPrice.toString(),
    quantityInStock: item.quantityInStock,
    imageUrl: item.imageUrl ?? null,
    imageUrls: item.imageUrls ?? [],
    isActive: item.isActive,
    approvalStatus: item.isActive ? "approved" : "pending",
    unitsSold: sales?.unitsSold ?? 0,
    revenue: sales?.revenue.toString() ?? "0",
  };
}

export async function getSupplierSummary(
  supplierUserId: string,
): Promise<SupplierSummaryDto | null> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
    include: {
      catalogItems: true,
      fulfillments: true,
    },
  });

  if (!supplier) return null;

  const activeProducts = supplier.catalogItems.filter((p) => p.isActive).length;
  const pendingProducts = supplier.catalogItems.filter((p) => !p.isActive).length;
  const pendingFulfillment = supplier.fulfillments.filter(
    (f) =>
      f.status === "PENDING" ||
      f.status === "ACCEPTED" ||
      f.status === "READY_FOR_PICKUP",
  ).length;
  const fulfilledOrders = supplier.fulfillments.filter(
    (f) => f.status === "FULFILLED",
  ).length;
  const acceptedOrders = supplier.fulfillments.filter(
    (f) => f.status === "ACCEPTED",
  ).length;

  const approvedOrders = await prisma.fulfillment.count({
    where: { supplierId: supplier.id },
  });

  const salesRows = await prisma.creditRequestItem.findMany({
    where: {
      catalogItem: { supplierId: supplier.id },
      creditRequest: {
        fulfillment: { status: "FULFILLED" },
      },
    },
    select: { quantity: true, unitPriceAtOrder: true },
  });

  let totalSalesRevenue = new Prisma.Decimal(0);
  let unitsSold = 0;
  for (const row of salesRows) {
    unitsSold += row.quantity;
    totalSalesRevenue = totalSalesRevenue.add(
      row.unitPriceAtOrder.mul(row.quantity),
    );
  }

  return {
    businessName: supplier.businessName,
    isVerified: supplier.isVerified,
    activeProducts,
    pendingProducts,
    approvedOrders,
    pendingFulfillment,
    fulfilledOrders,
    acceptedOrders,
    totalSalesRevenue: totalSalesRevenue.toString(),
    unitsSold,
  };
}

export async function listSupplierProducts(
  supplierUserId: string,
): Promise<SupplierCatalogItemDto[]> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
  });
  if (!supplier) return [];

  const [items, salesMap] = await Promise.all([
    prisma.catalogItem.findMany({
      where: { supplierId: supplier.id },
      orderBy: [{ isActive: "asc" }, { name: "asc" }],
    }),
    getCatalogSalesByItem(supplier.id),
  ]);

  return items.map((item) => mapCatalogItem(item, salesMap.get(item.id)));
}

export async function createSupplierProduct(
  supplierUserId: string,
  data: {
    name: string;
    description?: string;
    category: string;
    unitPrice: string;
    quantityInStock: number;
    sku?: string;
    imageUrl?: string;
    imageUrls?: string[];
  },
): Promise<SupplierCatalogItemDto> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
  });
  if (!supplier) throw new Error("Supplier profile not found.");

  const name = data.name.trim();
  const category = data.category.trim();
  if (!name || !category) throw new Error("Name and category are required.");
  if (data.quantityInStock < 0) throw new Error("Stock cannot be negative.");

  const price = new Prisma.Decimal(data.unitPrice);
  if (price.lte(0)) throw new Error("Price must be greater than zero.");

  const sku =
    data.sku?.trim() ||
    `SKU-${supplier.businessName.slice(0, 4).toUpperCase()}-${Date.now()}`;

  const existing = await prisma.catalogItem.findUnique({ where: { sku } });
  if (existing) throw new Error("SKU already exists. Choose a different SKU.");

  const extraImages = (data.imageUrls ?? []).filter((u) => u.trim()).slice(0, 5);

  const item = await prisma.catalogItem.create({
    data: {
      supplierId: supplier.id,
      name,
      description: data.description?.trim() || null,
      category,
      sku,
      unitPrice: price,
      quantityInStock: data.quantityInStock,
      imageUrl: data.imageUrl?.trim() || null,
      imageUrls: extraImages,
      isActive: false,
    },
  });

  await notifyAdmins(
    "New product pending approval",
    `${supplier.businessName} submitted "${name}" for catalog approval.`,
    "PRODUCT_PENDING",
  );

  return mapCatalogItem(item);
}

export async function getSupplierProfile(
  supplierUserId: string,
): Promise<SupplierProfileDto | null> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
    include: { user: true },
  });
  if (!supplier) return null;

  return {
    email: supplier.user.email,
    phoneNumber: supplier.user.phoneNumber,
    fullName: supplier.user.fullName,
    profilePictureUrl: supplier.user.profilePictureUrl,
    kycStatus: supplier.user.kycStatus,
    businessName: supplier.businessName,
    tin: supplier.tin,
    warehouseAddress: supplier.warehouseAddress,
    isVerified: supplier.isVerified,
  };
}

export async function updateSupplierProfile(
  supplierUserId: string,
  data: {
    fullName?: string;
    businessName?: string;
    tin?: string;
    warehouseAddress?: string;
    phoneNumber?: string;
  },
): Promise<SupplierProfileDto> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
  });
  if (!supplier) throw new Error("Supplier profile not found.");

  await prisma.$transaction(async (tx) => {
    const userData: { phoneNumber?: string; fullName?: string } = {};
    if (data.phoneNumber?.trim()) userData.phoneNumber = data.phoneNumber.trim();
    if (data.fullName?.trim()) userData.fullName = data.fullName.trim();
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: supplier.userId }, data: userData });
    }
    await tx.supplierProfile.update({
      where: { id: supplier.id },
      data: {
        ...(data.businessName?.trim()
          ? { businessName: data.businessName.trim() }
          : {}),
        ...(data.tin !== undefined ? { tin: data.tin.trim() || null } : {}),
        ...(data.warehouseAddress?.trim()
          ? { warehouseAddress: data.warehouseAddress.trim() }
          : {}),
      },
    });
  });

  const updated = await getSupplierProfile(supplierUserId);
  if (!updated) throw new Error("Profile update failed.");
  return updated;
}

export async function markFulfillmentFulfilled(
  fulfillmentId: string,
  supplierUserId: string,
): Promise<void> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
  });
  if (!supplier) throw new Error("Supplier not found.");

  const fulfillment = await prisma.fulfillment.findFirst({
    where: { id: fulfillmentId, supplierId: supplier.id },
    include: { creditRequest: { include: { farmer: { include: { user: true } } } } },
  });
  if (!fulfillment) throw new Error("Order not found.");
  if (
    fulfillment.status !== "READY_FOR_PICKUP" &&
    fulfillment.status !== "PARTIALLY_FULFILLED"
  ) {
    throw new Error("Mark the order ready before confirming delivery.");
  }

  await prisma.fulfillment.update({
    where: { id: fulfillmentId },
    data: { status: "FULFILLED", deliveredAt: new Date() },
  });

  await notifyUser(
    fulfillment.creditRequest.farmer.user.id,
    "Delivery completed — please confirm",
    "Your supplier delivered the order. Confirm receipt in your dashboard to add the amount to your loan balance.",
    "CONFIRM_RECEIPT",
    fulfillment.creditRequestId,
  );
}

export async function getAdminProfile(
  adminUserId: string,
): Promise<AdminProfileDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: adminUserId },
  });
  if (!user || user.role !== "ADMIN") return null;

  const [pendingOrders, pendingProducts, totalUsers] = await Promise.all([
    prisma.creditRequest.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    prisma.catalogItem.count({ where: { isActive: false } }),
    prisma.user.count(),
  ]);

  return {
    email: user.email,
    phoneNumber: user.phoneNumber,
    profilePictureUrl: user.profilePictureUrl,
    kycStatus: user.kycStatus,
    displayName: user.fullName ?? "FarmFax Operations",
    pendingOrders,
    pendingProducts,
    totalUsers,
  };
}

export async function getAdminSummary(): Promise<AdminSummaryDto> {
  const [
    pendingOrders,
    totalOrders,
    pendingProducts,
    activeProducts,
    farmers,
    suppliers,
    verifiedSuppliers,
    creditAgg,
  ] = await Promise.all([
    prisma.creditRequest.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    prisma.creditRequest.count(),
    prisma.catalogItem.count({ where: { isActive: false } }),
    prisma.catalogItem.count({ where: { isActive: true } }),
    prisma.farmerProfile.count(),
    prisma.supplierProfile.count(),
    prisma.supplierProfile.count({ where: { isVerified: true } }),
    prisma.farmerProfile.aggregate({ _sum: { utilizedCredit: true } }),
  ]);

  return {
    pendingOrders,
    totalOrders,
    pendingProducts,
    activeProducts,
    farmers,
    suppliers,
    verifiedSuppliers,
    totalCreditOutstanding: (creditAgg._sum.utilizedCredit ?? new Prisma.Decimal(0)).toString(),
  };
}

export async function listPendingProductsForAdmin(): Promise<
  Array<SupplierCatalogItemDto & { supplierName: string }>
> {
  const items = await prisma.catalogItem.findMany({
    where: { isActive: false },
    include: { supplier: { select: { businessName: true } } },
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    ...mapCatalogItem(item),
    supplierName: item.supplier.businessName,
  }));
}

export async function listAllProductsForAdmin(): Promise<
  Array<SupplierCatalogItemDto & { supplierName: string }>
> {
  const items = await prisma.catalogItem.findMany({
    include: { supplier: { select: { businessName: true } } },
    orderBy: [{ isActive: "asc" }, { name: "asc" }],
    take: 100,
  });

  return items.map((item) => ({
    ...mapCatalogItem(item),
    supplierName: item.supplier.businessName,
  }));
}

export async function approveProduct(
  productId: string,
  adminUserId: string,
): Promise<SupplierCatalogItemDto> {
  const item = await prisma.catalogItem.findUnique({
    where: { id: productId },
    include: { supplier: { include: { user: true } } },
  });
  if (!item) throw new Error("Product not found.");
  if (item.isActive) throw new Error("Product is already approved.");

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.catalogItem.update({
      where: { id: productId },
      data: { isActive: true },
    });
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "PRODUCT_APPROVED",
        metadata: { catalogItemId: productId },
      },
    });
    return row;
  });

  await notifyUser(
    item.supplier.user.id,
    "Product approved",
    `"${item.name}" is now live in the FarmFax catalog for farmers.`,
    "PRODUCT_APPROVED",
  );

  return mapCatalogItem(updated);
}

export async function rejectProduct(
  productId: string,
  adminUserId: string,
  reason?: string,
): Promise<void> {
  const item = await prisma.catalogItem.findUnique({
    where: { id: productId },
    include: { supplier: { include: { user: true } } },
  });
  if (!item) throw new Error("Product not found.");
  if (item.isActive) throw new Error("Cannot reject an active product.");

  await prisma.$transaction(async (tx) => {
    await tx.catalogItem.delete({ where: { id: productId } });
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "PRODUCT_REJECTED",
        metadata: { catalogItemId: productId, reason: reason ?? null },
      },
    });
  });

  await notifyUser(
    item.supplier.user.id,
    "Product not approved",
    reason?.trim()
      ? `"${item.name}" was not approved: ${reason.trim()}`
      : `"${item.name}" was not approved. You may resubmit with corrections.`,
    "PRODUCT_REJECTED",
  );
}

export async function listUsersForAdmin(): Promise<AdminUserDto[]> {
  const users = await prisma.user.findMany({
    include: { farmerProfile: true, supplierProfile: true },
    orderBy: { role: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    phoneNumber: u.phoneNumber,
    role: u.role,
    kycStatus: u.kycStatus,
    displayName:
      u.farmerProfile?.farmName ??
      u.supplierProfile?.businessName ??
      u.email,
    isVerified: u.supplierProfile?.isVerified ?? null,
    supplierProfileId: u.supplierProfile?.id ?? null,
    farmerProfileId: u.farmerProfile?.id ?? null,
  }));
}

export async function verifySupplier(
  supplierProfileId: string,
  adminUserId: string,
): Promise<void> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { id: supplierProfileId },
    include: { user: true },
  });
  if (!supplier) throw new Error("Supplier not found.");

  await prisma.$transaction(async (tx) => {
    await tx.supplierProfile.update({
      where: { id: supplierProfileId },
      data: { isVerified: true },
    });
    await tx.user.update({
      where: { id: supplier.userId },
      data: { kycStatus: "VERIFIED" },
    });
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "SUPPLIER_VERIFIED",
        metadata: { supplierProfileId },
      },
    });
  });

  await notifyUser(
    supplier.user.id,
    "Supplier verified",
    "Your business has been verified by FarmFax admin. You can list products and receive orders.",
    "SUPPLIER_VERIFIED",
  );
}

export async function updateUserKyc(
  userId: string,
  kycStatus: "VERIFIED" | "REJECTED" | "PENDING" | "UNVERIFIED",
  adminUserId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { kycStatus } });
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "KYC_UPDATED",
        metadata: { targetUserId: userId, kycStatus },
      },
    });
  });

  await notifyUser(
    userId,
    "KYC status updated",
    `Your verification status is now: ${kycStatus.toLowerCase()}.`,
    "KYC_UPDATED",
  );
}
