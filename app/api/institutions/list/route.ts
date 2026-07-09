import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";





export async function GET() {
  try {
    const rows = await prisma.institution.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        
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
