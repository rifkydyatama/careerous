// Menjadikan satu akun terdaftar sebagai ADMIN.
// 1) Daftarkan akun (mis. sebagai Konselor) lewat halaman /register.
// 2) Jalankan: ADMIN_EMAIL="email@anda.com" node -r dotenv/config prisma/seed-admin.mjs
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!email) {
    console.error("Set ADMIN_EMAIL terlebih dahulu, mis: ADMIN_EMAIL=\"admin@um.ac.id\" node -r dotenv/config prisma/seed-admin.mjs");
    process.exit(1);
  }
  const res = await pool.query(
    `UPDATE "User" SET "role"='ADMIN' WHERE lower("email")=$1 RETURNING id, name, email`,
    [email]
  );
  if (res.rowCount === 0) {
    console.error(`Tidak ada akun dengan email ${email}. Daftarkan dulu lewat /register.`);
    process.exit(1);
  }
  console.log(`Berhasil: ${res.rows[0].name || email} kini ADMIN.`);
}
main().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); }).finally(() => pool.end());
