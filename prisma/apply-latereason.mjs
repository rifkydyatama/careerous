// Menambah kolom JournalProgress.lateReason (tugas transisi modul terkunci). Idempoten.
// Jalankan: node -r dotenv/config prisma/apply-latereason.mjs
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(`ALTER TABLE "JournalProgress" ADD COLUMN IF NOT EXISTS "lateReason" TEXT;`);
  console.log("Selesai: kolom lateReason ditambahkan.");
}
main().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); }).finally(() => pool.end());
