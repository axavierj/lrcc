import { exec } from "child_process";
import { promisify } from "util";
import pkg from "@prisma/client";

const execAsync = promisify(exec);
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    // Try to query the User table to see if it exists
    await prisma.user.findFirst();
    console.log("✔️  Database appears ready. No migration needed.");
  } catch (e) {
    console.log("⚠️  Running migrations...");
    await execAsync("npx prisma migrate deploy");
    console.log("✅ Migrations applied.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
