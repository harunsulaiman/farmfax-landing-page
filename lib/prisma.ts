import { PrismaClient } from "@prisma/client";

/**
 * Transactional singleton — binds PrismaClient to the global object in
 * non-production environments to prevent connection pool exhaustion during
 * serverless hot-reload cycles (each invocation would otherwise spawn a new pool).
 *
 * Financial scale boundary: a single shared client instance is the correct
 * pattern for Next.js API routes executing concurrent credit/ledger queries.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
