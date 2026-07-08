// Membuat (atau mempromosikan) satu akun ADMIN dengan email+password.
// Jalankan: ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node -r dotenv/config prisma/create-admin.mjs
import { Pool } from "pg";
import { pbkdf2Sync, randomBytes } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function hashPassword(password) {
  // Sama dengan lib/portal-session.ts: pbkdf2 / 210000 / 64 / sha512.
  const salt = randomBytes(16).toString("base64url");
  const derived = pbkdf2Sync(password, salt, 210000, 64, "sha512").toString("base64url");
  return `pbkdf2$210000$${salt}$${derived}`;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || password.length < 8) {
    console.error("Set ADMIN_EMAIL & ADMIN_PASSWORD (min 8 karakter).");
    process.exit(1);
  }
  const passwordHash = hashPassword(password);
  const name = process.env.ADMIN_NAME || "Administrator";

  const res = await pool.query(
    `INSERT INTO "User" ("name","email","role","passwordHash")
     VALUES ($1,$2,'ADMIN',$3)
     ON CONFLICT ("email") DO UPDATE SET "role"='ADMIN', "passwordHash"=EXCLUDED."passwordHash", "name"=EXCLUDED."name"
     RETURNING id, email`,
    [name, email, passwordHash]
  );
  console.log(`Admin siap: ${res.rows[0].email}`);
}
main().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); }).finally(() => pool.end());
