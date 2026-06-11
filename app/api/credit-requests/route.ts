import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import {
  createCreditRequest,
  listAllForAdmin,
  listPendingForAdmin,
  listRequestsForFarmer,
  type CreateRequestItemInput,
} from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

interface CreateBody {
  items?: CreateRequestItemInput[];
  notes?: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const { user, session } = await requireSession();

    if (session.role === "farmer") {
      const requests = await listRequestsForFarmer(user.id);
      return jsonOk({ requests });
    }

    if (session.role === "admin") {
      const pending = await listPendingForAdmin();
      const all = await listAllForAdmin();
      return jsonOk({ pending, all });
    }

    return jsonError(new Error("FORBIDDEN"), 403);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession("farmer");
    const body = (await request.json()) as CreateBody;

    if (!body.items?.length) {
      return jsonError(new Error("Add at least one product."), 400);
    }

    const created = await createCreditRequest(user, body.items, body.notes);
    return jsonOk({ request: created }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
