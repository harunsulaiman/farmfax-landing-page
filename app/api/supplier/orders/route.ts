import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { listOrdersForSupplier } from "@/lib/order-workflow";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession("supplier");
    const orders = await listOrdersForSupplier(user.id);

    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    const fulfillments = supplier
      ? await prisma.fulfillment.findMany({
          where: { supplierId: supplier.id },
          select: {
            id: true,
            creditRequestId: true,
            status: true,
            verificationOtp: true,
            deliveredAt: true,
          },
        })
      : [];

    return jsonOk({ orders, fulfillments });
  } catch (error) {
    return jsonError(error);
  }
}
