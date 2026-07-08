// Menambah tabel Institution & kolom User.institutionId secara aditif & idempoten.
// Jalankan: node -r dotenv/config prisma/apply-institution.mjs
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const statements = [
  `CREATE TABLE IF NOT EXISTS "Institution" (
     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
     "name" TEXT NOT NULL,
     "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
     "subscriptionExpiresAt" TIMESTAMP(3),
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
   );`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "institutionId" UUID;`,
  `DO $$ BEGIN
     ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey"
       FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
];

async function main() {
  const client = await pool.connect();
  try {
    for (const sql of statements) {
      process.stdout.write(`-> ${sql.replace(/\s+/g, " ").slice(0, 70)}...\n`);
      await client.query(sql);
    }
    console.log("\nSelesai: tabel Institution & relasi diterapkan.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("GAGAL:", err.message);
  process.exit(1);
});
