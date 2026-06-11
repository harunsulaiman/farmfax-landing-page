import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import {
  getNotifications,
  markNotificationRead,
} from "@/lib/order-workflow";
import { requireSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const { user } = await requireSession();
    const notifications = await getNotifications(user.id);
    const unread = notifications.filter((n) => !n.read).length;
    return jsonOk({ notifications, unread });
  } catch (error) {
    return jsonError(error);
  }
}

interface PatchBody {
  notificationId?: string;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const { user } = await requireSession();
    const body = (await request.json()) as PatchBody;
    if (!body.notificationId) {
      return jsonError(new Error("notificationId required"), 400);
    }
    await markNotificationRead(body.notificationId, user.id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
