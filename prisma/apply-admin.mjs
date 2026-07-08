// Menambah nilai enum ADMIN & tabel ModuleContent. Idempoten.
// Jalankan: node -r dotenv/config prisma/apply-admin.mjs
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // ADD VALUE tidak boleh di dalam transaksi; jalankan langsung.
  await pool.query(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';`);
  await pool.query(`CREATE TABLE IF NOT EXISTS "ModuleContent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "phaseLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModuleContent_pkey" PRIMARY KEY ("id")
  );`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS "ModuleContent_number_key" ON "ModuleContent" ("number");`);
  console.log("Selesai: enum ADMIN & tabel ModuleContent diterapkan.");
}
main().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); }).finally(() => pool.end());
