import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import {
  Prisma,
  type CreditRequestStatus,
  type FulfillmentStatus,
  PrismaClient,
} from "@prisma/client";
import { provisionUserProfile } from "../lib/user-service";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234!";

const IMG = {
  feed: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop",
  fish: "https://images.unsplash.com/photo-1544551763-77ef2d0cfb3d?w=600&h=400&fit=crop",
  pond: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
  gear: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
  lime: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
} as const;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function demoAuth(fullName: string): Promise<{ fullName: string; passwordHash: string }> {
  return { fullName, passwordHash: await hashPassword(DEMO_PASSWORD) };
}

async function clearDatabase(): Promise<void> {
  console.log("[seed] Clearing all data…");
  await prisma.notification.deleteMany();
  await prisma.creditLedger.deleteMany();
  await prisma.creditRequestItem.deleteMany();
  await prisma.fulfillment.deleteMany();
  await prisma.creditRequest.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function seedCatalog(
  supplierId: string,
  items: ReadonlyArray<{
    name: string;
    description: string;
    category: string;
    sku: string;
    unitPrice: string;
    quantityInStock: number;
    imageUrl: string;
    extraImages?: string[];
    isActive?: boolean;
  }>,
): Promise<Record<string, string>> {
  const skuToId: Record<string, string> = {};
  for (const item of items) {
    const row = await prisma.catalogItem.create({
      data: {
        supplierId,
        name: item.name,
        description: item.description,
        category: item.category,
        sku: item.sku,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        quantityInStock: item.quantityInStock,
        imageUrl: item.imageUrl,
        imageUrls: item.extraImages ?? [],
        isActive: item.isActive ?? true,
      },
    });
    skuToId[item.sku] = row.id;
  }
  return skuToId;
}

async function seedOrder(params: {
  farmerProfileId: string;
  supplierProfileId: string;
  supplierUserId: string;
  farmerUserId: string;
  adminUserId: string;
  catalogItemId: string;
  quantity: number;
  unitPrice: string;
  status: CreditRequestStatus;
  fulfillmentStatus?: FulfillmentStatus;
  daysAgo: number;
  repaid?: boolean;
}): Promise<void> {
  const total = new Prisma.Decimal(params.unitPrice).mul(params.quantity);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - params.daysAgo);
  const dueDate = new Date(createdAt);
  dueDate.setMonth(dueDate.getMonth() + 4);

  const request = await prisma.creditRequest.create({
    data: {
      farmerId: params.farmerProfileId,
      status: params.status,
      totalAmount: total,
      interestRate: new Prisma.Decimal("5.00"),
      dueDate,
      createdAt,
      updatedAt: createdAt,
      disbursedAt:
        params.status === "DISBURSED" || params.status === "REPAID"
          ? new Date(createdAt.getTime() + 86400000)
          : null,
      repaidAt: params.repaid ? new Date() : null,
      items: {
        create: {
          catalogItemId: params.catalogItemId,
          quantity: params.quantity,
          unitPriceAtOrder: new Prisma.Decimal(params.unitPrice),
        },
      },
    },
  });

  if (
    params.status === "APPROVED" ||
    params.status === "DISBURSED" ||
    params.status === "REPAID"
  ) {
    const otpExpires = new Date();
    otpExpires.setDate(otpExpires.getDate() + 7);
    await prisma.fulfillment.create({
      data: {
        creditRequestId: request.id,
        supplierId: params.supplierProfileId,
        status: params.fulfillmentStatus ?? "PENDING",
        verificationOtp: String(Math.floor(100000 + Math.random() * 900000)),
        otpExpiresAt: otpExpires,
        deliveredAt: params.fulfillmentStatus === "FULFILLED" ? new Date() : null,
      },
    });
  }

  if (params.status === "DISBURSED" || params.status === "REPAID") {
    await prisma.farmerProfile.update({
      where: { id: params.farmerProfileId },
      data: { utilizedCredit: { increment: total } },
    });
    await prisma.creditLedger.create({
      data: {
        creditRequestId: request.id,
        amount: total,
        entryType: "DISBURSEMENT",
        createdAt,
      },
    });
  }

  if (params.repaid) {
    await prisma.creditLedger.create({
      data: {
        creditRequestId: request.id,
        amount: total,
        entryType: "REPAYMENT",
      },
    });
    await prisma.farmerProfile.update({
      where: { id: params.farmerProfileId },
      data: { utilizedCredit: { decrement: total } },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: params.farmerUserId,
        title: `Order ${params.status.toLowerCase()}`,
        body: `Your feed order for ₦${total.toFixed(2)} is now ${params.status.toLowerCase().replace("_", " ")}.`,
        type: "ORDER_UPDATE",
        creditRequestId: request.id,
        createdAt,
      },
      {
        userId: params.supplierUserId,
        title: "New farmer order",
        body: `An order worth ₦${total.toFixed(2)} needs your attention.`,
        type: "ORDER_NEW",
        creditRequestId: request.id,
        createdAt,
      },
      {
        userId: params.adminUserId,
        title: "Credit request logged",
        body: `Farmer order ₦${total.toFixed(2)} — status ${params.status}.`,
        type: "ADMIN_ORDER",
        creditRequestId: request.id,
        createdAt,
      },
    ],
  });
}

async function main(): Promise<void> {
  console.log("[seed] FarmFax — full demo dataset");
  await clearDatabase();

  const admin = await provisionUserProfile(
    "clerk_demo_admin_001",
    "admin.demo@famfax.ng",
    "+2348010000001",
    "ADMIN",
    null,
    await demoAuth("Ada Nwosu"),
  );
  await prisma.user.update({
    where: { id: admin.id },
    data: { kycStatus: "VERIFIED" },
  });

  const supplierA = await provisionUserProfile(
    "clerk_demo_supplier_001",
    "supplier.demo@famfax.ng",
    "+2348010000002",
    "SUPPLIER",
    {
      businessName: "AgroSupply Lagos Ltd",
      tin: "TIN-AGRO-2026-001",
      warehouseAddress: "12 Industrial Estate Rd, Ikeja, Lagos",
      isVerified: true,
    },
    await demoAuth("Chidi Okafor"),
  );
  await prisma.user.update({
    where: { id: supplierA.id },
    data: { kycStatus: "VERIFIED" },
  });

  const supplierB = await provisionUserProfile(
    "clerk_demo_supplier_002",
    "borno.feeds@famfax.ng",
    "+2348010000099",
    "SUPPLIER",
    {
      businessName: "Borno Aqua Feeds",
      tin: "TIN-BORNO-2026",
      warehouseAddress: "DH-220 Damboa Rd, Maiduguri, Borno",
      isVerified: true,
    },
    await demoAuth("Amina Bello"),
  );
  await prisma.user.update({
    where: { id: supplierB.id },
    data: { kycStatus: "VERIFIED" },
  });

  const farmerMain = await provisionUserProfile(
    "clerk_demo_farmer_001",
    "farmer.demo@famfax.ng",
    "+2348010000003",
    "FARMER",
    {
      farmName: "Green Valley Cooperative Farm",
      farmSizeHectares: "12.00",
      primaryCropType: "Catfish",
      creditLimit: "500000.00",
      utilizedCredit: "0.00",
    },
    await demoAuth("Ibrahim Musa"),
  );
  await prisma.user.update({
    where: { id: farmerMain.id },
    data: { kycStatus: "VERIFIED" },
  });

  const farmer2 = await provisionUserProfile(
    "clerk_demo_farmer_002",
    "fatima.ponds@famfax.ng",
    "+2348010000044",
    "FARMER",
    {
      farmName: "Fatima Aqua Ponds",
      farmSizeHectares: "6.50",
      primaryCropType: "Tilapia",
      creditLimit: "350000.00",
      utilizedCredit: "0.00",
    },
    await demoAuth("Fatima Yusuf"),
  );
  await prisma.user.update({
    where: { id: farmer2.id },
    data: { kycStatus: "VERIFIED" },
  });

  const supplierAId = supplierA.supplierProfile!.id;
  const supplierBId = supplierB.supplierProfile!.id;
  const farmerMainId = farmerMain.farmerProfile!.id;
  const farmer2Id = farmer2.farmerProfile!.id;

  const catalogA = await seedCatalog(supplierAId, [
    {
      name: "Floating Catfish Feed 6mm (15kg)",
      description:
        "High-protein floating pellets for grow-out catfish. 32% crude protein.",
      category: "Feed",
      sku: "FEED-CAT-6MM-15",
      unitPrice: "14200.00",
      quantityInStock: 400,
      imageUrl: IMG.feed,
      extraImages: [IMG.pond],
    },
    {
      name: "Catfish Fingerlings (juvenile)",
      description: "Healthy heteroclarias juveniles, 5–8 cm per fish.",
      category: "Fingerlings",
      sku: "FINGER-CAT-JUV-1000",
      unitPrice: "25.00",
      quantityInStock: 50000,
      imageUrl: IMG.fish,
      extraImages: [IMG.pond],
    },
    {
      name: "Pond Lime (25kg)",
      description: "Agricultural lime for pond pH and alkalinity management.",
      category: "Pond care",
      sku: "LIME-25KG",
      unitPrice: "3800.00",
      quantityInStock: 120,
      imageUrl: IMG.lime,
    },
    {
      name: "Vitamin Premix Booster (500g)",
      description: "Water-soluble vitamin blend — pending admin approval.",
      category: "Supplements",
      sku: "VIT-PREMIX-500",
      unitPrice: "6200.00",
      quantityInStock: 60,
      imageUrl: IMG.pond,
      isActive: false,
    },
  ]);

  const catalogB = await seedCatalog(supplierBId, [
    {
      name: "Premium Tilapia Feed 4mm",
      description: "Balanced nutrition for tilapia grow-out ponds.",
      category: "Feed",
      sku: "FEED-TIL-4MM",
      unitPrice: "12800.00",
      quantityInStock: 300,
      imageUrl: IMG.feed,
    },
    {
      name: "Aerator Paddle Wheel",
      description: "1.5 HP paddle-wheel aerator for earthen ponds up to 0.5 ha.",
      category: "Equipment",
      sku: "AERO-PADDLE-01",
      unitPrice: "185000.00",
      quantityInStock: 15,
      imageUrl: IMG.gear,
    },
    {
      name: "Probiotic Pond Solution (1L)",
      description: "Liquid probiotic to improve water quality and reduce ammonia.",
      category: "Pond care",
      sku: "PROBIO-1L",
      unitPrice: "4500.00",
      quantityInStock: 80,
      imageUrl: IMG.pond,
    },
  ]);

  await seedOrder({
    farmerProfileId: farmerMainId,
    supplierProfileId: supplierAId,
    supplierUserId: supplierA.id,
    farmerUserId: farmerMain.id,
    adminUserId: admin.id,
    catalogItemId: catalogA["FEED-CAT-6MM-15"]!,
    quantity: 10,
    unitPrice: "14200.00",
    status: "SUBMITTED",
    daysAgo: 1,
  });

  await seedOrder({
    farmerProfileId: farmerMainId,
    supplierProfileId: supplierAId,
    supplierUserId: supplierA.id,
    farmerUserId: farmerMain.id,
    adminUserId: admin.id,
    catalogItemId: catalogA["FINGER-CAT-JUV-1000"]!,
    quantity: 2000,
    unitPrice: "25.00",
    status: "APPROVED",
    fulfillmentStatus: "ACCEPTED",
    daysAgo: 5,
  });

  await seedOrder({
    farmerProfileId: farmerMainId,
    supplierProfileId: supplierAId,
    supplierUserId: supplierA.id,
    farmerUserId: farmerMain.id,
    adminUserId: admin.id,
    catalogItemId: catalogA["LIME-25KG"]!,
    quantity: 8,
    unitPrice: "3800.00",
    status: "DISBURSED",
    fulfillmentStatus: "READY_FOR_PICKUP",
    daysAgo: 12,
  });

  await seedOrder({
    farmerProfileId: farmer2Id,
    supplierProfileId: supplierBId,
    supplierUserId: supplierB.id,
    farmerUserId: farmer2.id,
    adminUserId: admin.id,
    catalogItemId: catalogB["FEED-TIL-4MM"]!,
    quantity: 15,
    unitPrice: "12800.00",
    status: "DISBURSED",
    fulfillmentStatus: "FULFILLED",
    daysAgo: 20,
  });

  await seedOrder({
    farmerProfileId: farmerMainId,
    supplierProfileId: supplierAId,
    supplierUserId: supplierA.id,
    farmerUserId: farmerMain.id,
    adminUserId: admin.id,
    catalogItemId: catalogA["FEED-CAT-6MM-15"]!,
    quantity: 5,
    unitPrice: "14200.00",
    status: "REPAID",
    fulfillmentStatus: "FULFILLED",
    daysAgo: 45,
    repaid: true,
  });

  await seedOrder({
    farmerProfileId: farmer2Id,
    supplierProfileId: supplierBId,
    supplierUserId: supplierB.id,
    farmerUserId: farmer2.id,
    adminUserId: admin.id,
    catalogItemId: catalogB["PROBIO-1L"]!,
    quantity: 4,
    unitPrice: "4500.00",
    status: "REJECTED",
    daysAgo: 8,
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: supplierA.id,
        title: "Product pending approval",
        body: 'Your "Vitamin Premix Booster" is awaiting admin review.',
        type: "PRODUCT_PENDING",
      },
      {
        userId: admin.id,
        title: "New product submission",
        body: "AgroSupply Lagos Ltd submitted Vitamin Premix Booster.",
        type: "PRODUCT_PENDING",
      },
      {
        userId: farmerMain.id,
        title: "Welcome to FarmFax",
        body: "Your account is verified. Browse feed and apply for your first loan.",
        type: "WELCOME",
        read: true,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "SEED_DEMO_DATA",
        metadata: { version: "2026-06" },
      },
      {
        userId: admin.id,
        action: "SUPPLIER_VERIFIED",
        metadata: { businessName: "AgroSupply Lagos Ltd" },
      },
    ],
  });

  console.log("[seed] Done — demo password:", DEMO_PASSWORD);
  console.log("[seed] Farmer:  farmer.demo@famfax.ng");
  console.log("[seed] Farmer2: fatima.ponds@famfax.ng");
  console.log("[seed] Supplier: supplier.demo@famfax.ng");
  console.log("[seed] Supplier2: borno.feeds@famfax.ng");
  console.log("[seed] Admin:   admin.demo@famfax.ng");
  console.log("[seed] Logins:  /farmer/login · /supplier/login · /admin/login");
}

main()
  .catch((error: unknown) => {
    console.error("[seed] Fatal", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
