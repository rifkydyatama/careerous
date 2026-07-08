// Menerapkan perubahan skema LIDM secara aditif & idempoten lewat koneksi pg
// (jalur yang sama dengan runtime aplikasi), karena schema engine Prisma tidak
// dapat menembus pooler Supabase dan koneksi langsung tidak terjangkau.
//
// Jalankan: node -r dotenv/config prisma/apply-changes.mjs
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const statements = [
  // Enum PlanTier (idempoten via DO/EXCEPTION)
  `DO $$ BEGIN
     CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PREMIUM');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // User.plan
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" "PlanTier" NOT NULL DEFAULT 'FREE';`,

  // JournalProgress: field deadline
  `ALTER TABLE "JournalProgress" ADD COLUMN IF NOT EXISTS "unlockedAt" TIMESTAMP(3);`,
  `ALTER TABLE "JournalProgress" ADD COLUMN IF NOT EXISTS "deadlineAt" TIMESTAMP(3);`,
  `ALTER TABLE "JournalProgress" ADD COLUMN IF NOT EXISTS "lateCount" INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE "JournalProgress" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);`,

  // Notification
  `CREATE TABLE IF NOT EXISTS "Notification" (
     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
     "userId" UUID NOT NULL,
     "type" TEXT NOT NULL,
     "title" TEXT NOT NULL,
     "body" TEXT NOT NULL,
     "read" BOOLEAN NOT NULL DEFAULT false,
     "moduleNumber" INTEGER,
     "relatedStudentId" UUID,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
   );`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification" ("userId");`,
  `DO $$ BEGIN
     ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // CareerExplorationReport
  `CREATE TABLE IF NOT EXISTS "CareerExplorationReport" (
     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
     "studentId" UUID NOT NULL,
     "summary" TEXT NOT NULL,
     "dominantThemes" TEXT NOT NULL,
     "sentimentLabel" TEXT NOT NULL,
     "sentimentScore" INTEGER NOT NULL,
     "topInterest" TEXT,
     "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
     "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "CareerExplorationReport_pkey" PRIMARY KEY ("id")
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CareerExplorationReport_studentId_key" ON "CareerExplorationReport" ("studentId");`,
  `DO $$ BEGIN
     ALTER TABLE "CareerExplorationReport" ADD CONSTRAINT "CareerExplorationReport_studentId_fkey"
       FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
];

async function main() {
  const client = await pool.connect();
  try {
    for (const sql of statements) {
      const label = sql.replace(/\s+/g, " ").slice(0, 70);
      process.stdout.write(`-> ${label}...\n`);
      await client.query(sql);
    }
    console.log("\nSelesai: semua perubahan skema diterapkan.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("GAGAL:", err.message);
  process.exit(1);
});
