import { Prisma, type CreditRequestStatus, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface CreateRequestItemInput {
  catalogItemId: string;
  quantity: number;
}

export interface CatalogProductDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sku: string;
  unitPrice: string;
  quantityInStock: number;
  imageUrl: string | null;
  imageUrls: string[];
  supplierId: string;
  supplierName: string;
}

export interface CreditRequestDto {
  id: string;
  status: CreditRequestStatus;
  totalAmount: string;
  createdAt: string;
  farmerName: string;
  supplierName: string;
  dueDate?: string;
  interestRate?: string;
  repaidAt?: string | null;
  disbursedAt?: string | null;
  fulfillmentStatus?: string | null;
  verificationOtp?: string | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
}

export interface FarmerSummaryDto {
  creditLimit: string;
  utilizedCredit: string;
  availableCredit: string;
  farmName: string;
  farmSizeHectares: string;
  primaryCropType: string;
  pendingRequests: number;
  activeLoans: number;
  nextDueDate: string | null;
  eligibleToBorrow: boolean;
  eligibilityMessage: string;
  kycStatus: string;
  availableProducts: number;
  nextRepaymentAmount: string | null;
  repaidThisMonth: string;
  estimatedYieldTonnes: string;
  pendingBreakdown: string;
}

export interface FarmerProfileDto {
  email: string;
  phoneNumber: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  kycStatus: string;
  farmName: string;
  farmSizeHectares: string;
  primaryCropType: string;
  creditLimit: string;
  utilizedCredit: string;
  availableCredit: string;
}

export interface FarmerOrderFulfillmentDto {
  id: string;
  creditRequestId: string;
  status: string;
  verificationOtp: string;
  deliveredAt: string | null;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function getFarmerPendingCommitment(farmerId: string): Promise<Prisma.Decimal> {
  const agg = await prisma.creditRequest.aggregate({
    where: {
      farmerId,
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
    },
    _sum: { totalAmount: true },
  });
  return agg._sum.totalAmount ?? new Prisma.Decimal(0);
}

function farmerAvailableCredit(
  creditLimit: Prisma.Decimal,
  utilizedCredit: Prisma.Decimal,
  pendingCommitment: Prisma.Decimal,
): Prisma.Decimal {
  return creditLimit.sub(utilizedCredit).sub(pendingCommitment);
}

async function notifyUser(
  userId: string,
  title: string,
  body: string,
  type: string,
  creditRequestId?: string,
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      creditRequestId: creditRequestId ?? null,
    },
  });
}

async function notifyAdmins(
  title: string,
  body: string,
  type: string,
  creditRequestId: string,
): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin) =>
      notifyUser(admin.id, title, body, type, creditRequestId),
    ),
  );
}

export async function listCatalogProducts(): Promise<CatalogProductDto[]> {
  const items = await prisma.catalogItem.findMany({
    where: { isActive: true, quantityInStock: { gt: 0 } },
    include: {
      supplier: { select: { id: true, businessName: true } },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    category: item.category,
    sku: item.sku,
    unitPrice: item.unitPrice.toString(),
    quantityInStock: item.quantityInStock,
    imageUrl: item.imageUrl ?? null,
    imageUrls: item.imageUrls ?? [],
    supplierId: item.supplier.id,
    supplierName: item.supplier.businessName,
  }));
}

export async function createCreditRequest(
  farmerUser: User,
  items: CreateRequestItemInput[],
  notes?: string,
): Promise<CreditRequestDto> {
  if (items.length === 0) {
    throw new Error("At least one product is required.");
  }

  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUser.id },
  });

  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const catalogRows = await prisma.catalogItem.findMany({
    where: {
      id: { in: items.map((i) => i.catalogItemId) },
      isActive: true,
    },
    include: { supplier: true },
  });

  if (catalogRows.length !== items.length) {
    throw new Error("One or more products are unavailable.");
  }

  const supplierIds = new Set(catalogRows.map((r) => r.supplierId));
  if (supplierIds.size > 1) {
    throw new Error("Please request products from one supplier at a time.");
  }

  const supplier = catalogRows[0]?.supplier;
  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  let total = new Prisma.Decimal(0);
  const lineItems: Array<{
    catalogItemId: string;
    quantity: number;
    unitPriceAtOrder: Prisma.Decimal;
  }> = [];

  for (const input of items) {
    const row = catalogRows.find((c) => c.id === input.catalogItemId);
    if (!row) continue;
    if (input.quantity < 1 || input.quantity > row.quantityInStock) {
      throw new Error(`Invalid quantity for ${row.name}.`);
    }
    const lineTotal = row.unitPrice.mul(input.quantity);
    total = total.add(lineTotal);
    lineItems.push({
      catalogItemId: row.id,
      quantity: input.quantity,
      unitPriceAtOrder: row.unitPrice,
    });
  }

  const pendingCommitment = await getFarmerPendingCommitment(farmer.id);
  const available = farmerAvailableCredit(
    farmer.creditLimit,
    farmer.utilizedCredit,
    pendingCommitment,
  );
  if (total.gt(available)) {
    throw new Error(
      `Request exceeds available credit (₦${available.toFixed(2)} remaining after pending orders).`,
    );
  }

  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 4);

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.creditRequest.create({
      data: {
        farmerId: farmer.id,
        status: "SUBMITTED",
        totalAmount: total,
        interestRate: new Prisma.Decimal("5.00"),
        dueDate,
        items: { create: lineItems },
      },
      include: {
        items: { include: { catalogItem: true } },
        farmer: { include: { user: true } },
      },
    });

    if (notes?.trim()) {
      await tx.auditLog.create({
        data: {
          userId: farmerUser.id,
          action: "CREDIT_REQUEST_NOTES",
          metadata: { creditRequestId: created.id, notes: notes.trim() },
        },
      });
    }

    return created;
  });

  await notifyAdmins(
    "New order to review",
    `${request.farmer.farmName} placed an order for ₦${total.toFixed(2)} from ${supplier.businessName}. Approve to send it to the supplier.`,
    "REQUEST_SUBMITTED",
    request.id,
  );

  await notifyUser(
    farmerUser.id,
    "Order submitted",
    `Your order of ₦${total.toFixed(2)} is pending admin approval. Loan balance updates after you confirm delivery.`,
    "ORDER_SUBMITTED",
    request.id,
  );

  return mapRequestToDto(request, supplier.businessName);
}

export async function listRequestsForFarmer(
  farmerUserId: string,
): Promise<CreditRequestDto[]> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
  });
  if (!farmer) return [];

  const requests = await prisma.creditRequest.findMany({
    where: { farmerId: farmer.id },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: true,
      fulfillment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => {
    const supplierName =
      r.items[0]?.catalogItem.supplier.businessName ?? "Supplier";
    return mapRequestToDto(r, supplierName);
  });
}

export async function listOrdersForFarmer(
  farmerUserId: string,
): Promise<{
  orders: CreditRequestDto[];
  fulfillments: FarmerOrderFulfillmentDto[];
}> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
  });
  if (!farmer) return { orders: [], fulfillments: [] };

  const requests = await prisma.creditRequest.findMany({
    where: { farmerId: farmer.id },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: true,
      fulfillment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const orders = requests.map((r) => {
    const supplierName =
      r.items[0]?.catalogItem.supplier.businessName ?? "Supplier";
    return mapRequestToDto(r, supplierName);
  });

  const fulfillments = requests
    .filter((r) => r.fulfillment)
    .map((r) => ({
      id: r.fulfillment!.id,
      creditRequestId: r.id,
      status: r.fulfillment!.status,
      verificationOtp: r.fulfillment!.verificationOtp,
      deliveredAt: r.fulfillment!.deliveredAt?.toISOString() ?? null,
    }));

  return { orders, fulfillments };
}

export async function listPendingForAdmin(): Promise<CreditRequestDto[]> {
  const requests = await prisma.creditRequest.findMany({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return requests.map((r) => {
    const supplierName =
      r.items[0]?.catalogItem.supplier.businessName ?? "Supplier";
    return mapRequestToDto(r, supplierName);
  });
}

export async function listAllForAdmin(): Promise<CreditRequestDto[]> {
  const requests = await prisma.creditRequest.findMany({
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return requests.map((r) => {
    const supplierName =
      r.items[0]?.catalogItem.supplier.businessName ?? "Supplier";
    return mapRequestToDto(r, supplierName);
  });
}

export async function approveCreditRequest(
  requestId: string,
  adminUser: User,
): Promise<CreditRequestDto> {
  const request = await prisma.creditRequest.findUnique({
    where: { id: requestId },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: { include: { user: true } },
      fulfillment: true,
    },
  });

  if (!request) throw new Error("Request not found.");
  if (request.status !== "SUBMITTED" && request.status !== "UNDER_REVIEW") {
    throw new Error("Request cannot be approved in its current state.");
  }

  const supplier = request.items[0]?.catalogItem.supplier;
  if (!supplier) throw new Error("Supplier missing on request.");

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.creditRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
      include: {
        items: { include: { catalogItem: true } },
        farmer: { include: { user: true } },
      },
    });

    if (!request.fulfillment) {
      await tx.fulfillment.create({
        data: {
          creditRequestId: requestId,
          supplierId: supplier.id,
          status: "PENDING",
          verificationOtp: otp,
          otpExpiresAt: otpExpires,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "CREDIT_REQUEST_APPROVED",
        metadata: { creditRequestId: requestId },
      },
    });

    return req;
  });

  const supplierUser = await prisma.user.findUnique({
    where: { id: supplier.userId },
  });

  if (supplierUser) {
    await notifyUser(
      supplierUser.id,
      "New order to fulfill",
      `${request.farmer.farmName} order approved — ₦${request.totalAmount.toFixed(2)}. Prepare delivery and share OTP at pond.`,
      "ORDER_APPROVED_SUPPLIER",
      requestId,
    );
  }

  await notifyUser(
    request.farmer.user.id,
    "Request approved",
    `Your input request was approved. ${supplier.businessName} will deliver soon. OTP: ${otp}`,
    "ORDER_APPROVED_FARMER",
    requestId,
  );

  return mapRequestToDto(updated, supplier.businessName);
}

export async function rejectCreditRequest(
  requestId: string,
  adminUser: User,
  reason?: string,
): Promise<CreditRequestDto> {
  const request = await prisma.creditRequest.findUnique({
    where: { id: requestId },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: { include: { user: true } },
    },
  });

  if (!request) throw new Error("Request not found.");
  if (request.status !== "SUBMITTED" && request.status !== "UNDER_REVIEW") {
    throw new Error("Request cannot be rejected in its current state.");
  }

  const supplierName =
    request.items[0]?.catalogItem.supplier.businessName ?? "Supplier";

  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.creditRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
      include: {
        items: { include: { catalogItem: true } },
        farmer: { include: { user: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "CREDIT_REQUEST_REJECTED",
        metadata: { creditRequestId: requestId, reason: reason ?? null },
      },
    });

    return req;
  });

  await notifyUser(
    request.farmer.user.id,
    "Request not approved",
    reason?.trim()
      ? `Your request was declined: ${reason.trim()}`
      : "Your input request was declined. Contact support for details.",
    "ORDER_REJECTED",
    requestId,
  );

  return mapRequestToDto(updated, supplierName);
}

export async function listOrdersForSupplier(
  supplierUserId: string,
): Promise<CreditRequestDto[]> {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: supplierUserId },
  });
  if (!supplier) return [];

  const fulfillments = await prisma.fulfillment.findMany({
    where: {
      supplierId: supplier.id,
      creditRequest: { status: "APPROVED" },
    },
    include: {
      creditRequest: {
        include: {
          items: { include: { catalogItem: { include: { supplier: true } } } },
          farmer: true,
        },
      },
    },
    orderBy: { creditRequest: { createdAt: "desc" } },
  });

  return fulfillments.map((f) =>
    mapRequestToDto(f.creditRequest, supplier.businessName),
  );
}

export async function acceptFulfillment(
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
  if (fulfillment.status !== "PENDING") {
    throw new Error("This order has already been accepted or completed.");
  }
  if (fulfillment.creditRequest.status !== "APPROVED") {
    throw new Error("Order is not approved yet.");
  }

  await prisma.fulfillment.update({
    where: { id: fulfillmentId },
    data: { status: "ACCEPTED" },
  });

  await notifyUser(
    fulfillment.creditRequest.farmer.user.id,
    "Supplier accepted your order",
    `${supplier.businessName} will prepare your inputs for delivery.`,
    "FULFILLMENT_ACCEPTED",
    fulfillment.creditRequestId,
  );
}

export async function markFulfillmentReady(
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
  if (fulfillment.status !== "ACCEPTED") {
    throw new Error("Accept the order before marking it ready.");
  }

  await prisma.fulfillment.update({
    where: { id: fulfillmentId },
    data: { status: "READY_FOR_PICKUP" },
  });

  await notifyUser(
    fulfillment.creditRequest.farmer.user.id,
    "Order ready for pickup",
    "Your inputs are packed and ready. Expect delivery to your pond shortly.",
    "FULFILLMENT_READY",
    fulfillment.creditRequestId,
  );
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

function mapRequestToDto(
  request: {
    id: string;
    status: CreditRequestStatus;
    totalAmount: Prisma.Decimal;
    createdAt: Date;
    dueDate?: Date;
    interestRate?: Prisma.Decimal;
    repaidAt?: Date | null;
    disbursedAt?: Date | null;
    farmer: { farmName: string };
    fulfillment?: {
      status: string;
      verificationOtp: string;
    } | null;
    items: Array<{
      quantity: number;
      unitPriceAtOrder: Prisma.Decimal;
      catalogItem: { name: string };
    }>;
  },
  supplierName: string,
): CreditRequestDto {
  return {
    id: request.id,
    status: request.status,
    totalAmount: request.totalAmount.toString(),
    createdAt: request.createdAt.toISOString(),
    farmerName: request.farmer.farmName,
    supplierName,
    dueDate: request.dueDate?.toISOString(),
    interestRate: request.interestRate?.toString(),
    repaidAt: request.repaidAt?.toISOString() ?? null,
    disbursedAt: request.disbursedAt?.toISOString() ?? null,
    fulfillmentStatus: request.fulfillment?.status ?? null,
    verificationOtp: request.fulfillment?.verificationOtp ?? null,
    items: request.items.map((item) => ({
      name: item.catalogItem.name,
      quantity: item.quantity,
      unitPrice: item.unitPriceAtOrder.toString(),
      lineTotal: item.unitPriceAtOrder.mul(item.quantity).toString(),
    })),
  };
}

export async function getFarmerSummary(
  farmerUserId: string,
): Promise<FarmerSummaryDto | null> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
    include: {
      user: { select: { kycStatus: true } },
      creditRequests: {
        include: {
          items: { include: { catalogItem: { select: { category: true } } } },
        },
      },
    },
  });

  if (!farmer) return null;

  const pendingRequests = farmer.creditRequests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW",
  );
  const pending = pendingRequests.length;

  const activeLoans = farmer.creditRequests.filter((r) => r.status === "DISBURSED");

  const nextLoan = [...activeLoans].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
  )[0];
  const nextDue = nextLoan?.dueDate;
  const nextRepaymentAmount = nextLoan
    ? nextLoan.totalAmount
        .mul(new Prisma.Decimal(1).add(nextLoan.interestRate.div(100)))
        .toString()
    : null;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const repaidAgg = await prisma.creditLedger.aggregate({
    where: {
      entryType: "REPAYMENT",
      createdAt: { gte: monthStart },
      creditRequest: { farmerId: farmer.id },
    },
    _sum: { amount: true },
  });

  const categoryCounts = new Map<string, number>();
  for (const req of pendingRequests) {
    for (const item of req.items) {
      const cat = item.catalogItem.category.toLowerCase();
      const key = cat.includes("feed")
        ? "feed"
        : cat.includes("med") || cat.includes("care")
          ? "medication"
          : "input";
      categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    }
  }
  const breakdownParts: string[] = [];
  if (categoryCounts.get("feed")) {
    breakdownParts.push(`${categoryCounts.get("feed")} feed`);
  }
  if (categoryCounts.get("medication")) {
    breakdownParts.push(`${categoryCounts.get("medication")} medication`);
  }
  if (categoryCounts.get("input")) {
    breakdownParts.push(`${categoryCounts.get("input")} input`);
  }
  const pendingBreakdown =
    breakdownParts.length > 0 ? breakdownParts.join(", ") : "No pending items";

  const yieldTonnes = farmer.farmSizeHectares.mul(0.7);

  const pendingCommitment = await getFarmerPendingCommitment(farmer.id);
  const available = farmerAvailableCredit(
    farmer.creditLimit,
    farmer.utilizedCredit,
    pendingCommitment,
  );
  const kycVerified = farmer.user.kycStatus === "VERIFIED";
  const eligibleToBorrow = kycVerified && available.gt(0);

  let eligibilityMessage = "You can request inputs on credit.";
  if (!kycVerified) {
    eligibilityMessage = "Complete KYC verification to borrow on credit.";
  } else if (available.lte(0)) {
    eligibilityMessage = "Credit limit reached — repay active loans to borrow more.";
  }

  const productCount = await prisma.catalogItem.count({
    where: { isActive: true, quantityInStock: { gt: 0 } },
  });

  return {
    creditLimit: farmer.creditLimit.toString(),
    utilizedCredit: farmer.utilizedCredit.toString(),
    availableCredit: available.toString(),
    farmName: farmer.farmName,
    farmSizeHectares: farmer.farmSizeHectares.toString(),
    primaryCropType: farmer.primaryCropType,
    kycStatus: farmer.user.kycStatus,
    pendingRequests: pending,
    activeLoans: activeLoans.length,
    nextDueDate: nextDue?.toISOString() ?? null,
    eligibleToBorrow,
    eligibilityMessage,
    availableProducts: productCount,
    nextRepaymentAmount,
    repaidThisMonth: (repaidAgg._sum.amount ?? new Prisma.Decimal(0)).toString(),
    estimatedYieldTonnes: yieldTonnes.toFixed(1),
    pendingBreakdown,
  };
}

export async function getFarmerProfile(
  farmerUserId: string,
): Promise<FarmerProfileDto | null> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
    include: { user: true },
  });

  if (!farmer) return null;

  const pendingCommitment = await getFarmerPendingCommitment(farmer.id);
  const available = farmerAvailableCredit(
    farmer.creditLimit,
    farmer.utilizedCredit,
    pendingCommitment,
  );

  return {
    email: farmer.user.email,
    phoneNumber: farmer.user.phoneNumber,
    fullName: farmer.user.fullName,
    profilePictureUrl: farmer.user.profilePictureUrl,
    kycStatus: farmer.user.kycStatus,
    farmName: farmer.farmName,
    farmSizeHectares: farmer.farmSizeHectares.toString(),
    primaryCropType: farmer.primaryCropType,
    creditLimit: farmer.creditLimit.toString(),
    utilizedCredit: farmer.utilizedCredit.toString(),
    availableCredit: available.toString(),
  };
}

export async function updateFarmerProfile(
  farmerUserId: string,
  data: {
    fullName?: string;
    farmName?: string;
    farmSizeHectares?: string;
    primaryCropType?: string;
    phoneNumber?: string;
  },
): Promise<FarmerProfileDto> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
  });

  if (!farmer) throw new Error("Farmer profile not found.");

  await prisma.$transaction(async (tx) => {
    const userData: { phoneNumber?: string; fullName?: string } = {};
    if (data.phoneNumber?.trim()) userData.phoneNumber = data.phoneNumber.trim();
    if (data.fullName?.trim()) userData.fullName = data.fullName.trim();
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: farmer.userId }, data: userData });
    }

    await tx.farmerProfile.update({
      where: { id: farmer.id },
      data: {
        ...(data.farmName?.trim() ? { farmName: data.farmName.trim() } : {}),
        ...(data.primaryCropType?.trim()
          ? { primaryCropType: data.primaryCropType.trim() }
          : {}),
        ...(data.farmSizeHectares
          ? { farmSizeHectares: new Prisma.Decimal(data.farmSizeHectares) }
          : {}),
      },
    });
  });

  const updated = await getFarmerProfile(farmerUserId);
  if (!updated) throw new Error("Profile update failed.");
  return updated;
}

export async function confirmOrderReceipt(
  creditRequestId: string,
  farmerUserId: string,
): Promise<CreditRequestDto> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
  });
  if (!farmer) throw new Error("Farmer profile not found.");

  const request = await prisma.creditRequest.findFirst({
    where: { id: creditRequestId, farmerId: farmer.id },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: { include: { user: true } },
      fulfillment: true,
    },
  });

  if (!request) throw new Error("Order not found.");
  if (request.status !== "APPROVED") {
    throw new Error("This order cannot be confirmed in its current state.");
  }
  if (request.fulfillment?.status !== "FULFILLED") {
    throw new Error("Wait for the supplier to deliver before confirming receipt.");
  }

  const supplier = request.items[0]?.catalogItem.supplier;
  const supplierName = supplier?.businessName ?? "Supplier";

  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.creditRequest.update({
      where: { id: creditRequestId },
      data: { status: "DISBURSED", disbursedAt: new Date() },
      include: {
        items: { include: { catalogItem: true } },
        farmer: true,
        fulfillment: true,
      },
    });

    await tx.farmerProfile.update({
      where: { id: farmer.id },
      data: { utilizedCredit: { increment: request.totalAmount } },
    });

    await tx.creditLedger.create({
      data: {
        creditRequestId,
        amount: request.totalAmount,
        entryType: "DISBURSEMENT",
        referenceId: `disburse-${creditRequestId}`,
      },
    });

    return req;
  });

  await notifyAdmins(
    "Loan balance updated",
    `${request.farmer.farmName} confirmed delivery — ₦${request.totalAmount.toFixed(2)} added to loan balance.`,
    "ORDER_DISBURSED",
    creditRequestId,
  );

  if (supplier) {
    const supplierUser = await prisma.user.findUnique({
      where: { id: supplier.userId },
    });
    if (supplierUser) {
      await notifyUser(
        supplierUser.id,
        "Farmer confirmed receipt",
        `${request.farmer.farmName} confirmed the delivery. Order complete.`,
        "ORDER_COMPLETE",
        creditRequestId,
      );
    }
  }

  await notifyUser(
    farmer.userId,
    "Loan balance updated",
    `₦${request.totalAmount.toFixed(2)} has been added to your loan balance. Repay from your Repayment Schedule when ready.`,
    "LOAN_DISBURSED",
    creditRequestId,
  );

  return mapRequestToDto(updated, supplierName);
}

export async function repayCreditRequest(
  farmerUserId: string,
  requestId: string,
): Promise<CreditRequestDto> {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: farmerUserId },
  });

  if (!farmer) throw new Error("Farmer profile not found.");

  const request = await prisma.creditRequest.findFirst({
    where: { id: requestId, farmerId: farmer.id },
    include: {
      items: { include: { catalogItem: { include: { supplier: true } } } },
      farmer: true,
      fulfillment: true,
    },
  });

  if (!request) throw new Error("Loan not found.");
  if (request.status !== "DISBURSED") {
    throw new Error("Only disbursed loans can be repaid.");
  }

  const supplierName =
    request.items[0]?.catalogItem.supplier.businessName ?? "Supplier";

  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.creditRequest.update({
      where: { id: requestId },
      data: { status: "REPAID", repaidAt: new Date() },
      include: {
        items: { include: { catalogItem: true } },
        farmer: true,
        fulfillment: true,
      },
    });

    await tx.farmerProfile.update({
      where: { id: farmer.id },
      data: { utilizedCredit: { decrement: request.totalAmount } },
    });

    await tx.creditLedger.create({
      data: {
        creditRequestId: requestId,
        amount: request.totalAmount,
        entryType: "REPAYMENT",
        referenceId: `repay-${requestId}`,
      },
    });

    return req;
  });

  await notifyUser(
    farmer.userId,
    "Loan repaid",
    `Your loan of ₦${request.totalAmount.toFixed(2)} to ${supplierName} has been marked as repaid. Credit restored.`,
    "LOAN_REPAID",
    requestId,
  );

  return mapRequestToDto(updated, supplierName);
}
