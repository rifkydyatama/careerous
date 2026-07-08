import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET /api/institutions/list — daftar sekolah untuk halaman registrasi (publik).
// Menyertakan flag hasCounselor: true bila sudah ada guru/konselor yang mendaftar di sekolah itu.
// Siswa hanya boleh memilih sekolah yang sudah ada gurunya; guru memakai daftar ini sebagai
// saran nama agar tidak membuat sekolah duplikat dengan ejaan berbeda.
export async function GET() {
  try {
    const rows = await prisma.institution.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        // Ambil maksimal 1 konselor sebagai penanda "sekolah punya guru".
        users: {
          where: { role: "COUNSELOR" },
          select: { id: true },
          take: 1,
        },
      },
    });

    const institutions = rows.map((row) => ({
      id: row.id,
      name: row.name,
      hasCounselor: row.users.length > 0,
    }));

    return NextResponse.json({ institutions });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat daftar sekolah" },
      { status: 500 }
    );
  }
}
