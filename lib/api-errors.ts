import { Prisma } from "@prisma/client";

const PRISMA_INVOCATION_RE = /Invalid `.*` invocation/i;

/** Maps thrown errors to short, user-safe messages (no Prisma stack traces). */
export function toUserFacingError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (Array.isArray(target)) {
        if (target.includes("email")) {
          return "An account with this email already exists. Try logging in instead.";
        }
        if (target.includes("phoneNumber")) {
          return "An account with this phone number already exists.";
        }
        if (target.includes("businessName")) {
          return "This business name is already registered.";
        }
        if (target.includes("sku")) {
          return "This product SKU is already in use. Choose a different SKU.";
        }
      }
      return "This information is already on file. Try logging in or use different details.";
    }
    if (error.code === "P2025") {
      return "The requested record was not found.";
    }
    if (error.code === "P1001") {
      return "We cannot reach the database right now. Please try again in a moment.";
    }
    return "We could not complete your request. Please try again.";
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return "A server configuration issue blocked this action. Please try again shortly.";
  }

  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg === "UNAUTHORIZED") return "Please sign in to continue.";
    if (msg === "FORBIDDEN") return "You do not have permission for this action.";
    if (PRISMA_INVOCATION_RE.test(msg)) {
      return "We could not save your account details. Please try again in a moment.";
    }
    if (msg.length > 0 && msg.length <= 280) return msg;
    if (msg.length > 280) {
      return "Something went wrong. Please check your details and try again.";
    }
  }

  return "Something went wrong. Please try again.";
}

/** Read `{ error: string }` from a failed fetch response. */
export async function readApiError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    const message = data.error?.trim();
    return message && message.length <= 280 ? message : fallback;
  } catch {
    return fallback;
  }
}

/** Throws a user-facing error when an API response is not OK. */
export async function throwIfNotOk(
  res: Response,
  fallback: string,
): Promise<void> {
  if (!res.ok) {
    throw new Error(await readApiError(res, fallback));
  }
}
