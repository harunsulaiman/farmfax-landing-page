/**
 * Create a platform admin account (developer / ops use only).
 *
 * Usage:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/create-admin.ts email@example.com "Your Name" "SecurePass123!"
 */
import { randomUUID } from "node:crypto";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";
import { provisionUserProfile } from "../lib/user-service";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function main(): Promise<void> {
  const [, , emailArg, fullNameArg, passwordArg] = process.argv;

  if (!emailArg || !fullNameArg || !passwordArg) {
    console.error(
      "Usage: npx ts-node scripts/create-admin.ts <email> <fullName> <password>",
    );
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const fullName = fullNameArg.trim();
  const password = passwordArg;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`User already exists: ${email}`);
    process.exit(1);
  }

  const clerkId = `clerk_admin_${randomUUID()}`;
  const phone = `+2348${Date.now().toString().slice(-9)}`;
  const passwordHash = await hashPassword(password);

  await provisionUserProfile(clerkId, email, phone, "ADMIN", null, {
    fullName,
    passwordHash,
  });

  console.log(`Admin created: ${email}`);
  console.log(`Log in at /admin/login`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
