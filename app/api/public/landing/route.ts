import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// Data publik untuk landing page: infografik jumlah pengguna (tanpa admin),
// profil konselor, dan daftar sekolah mitra. Tidak memerlukan autentikasi.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [students, counselors, institutionsCount, modulesDone, counselorRows, partnerRows] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "COUNSELOR" } }),
        prisma.institution.count(),
        prisma.journalProgress.count({ where: { status: "COMPLETED" } }),
        prisma.user.findMany({
          where: { role: "COUNSELOR" },
          orderBy: [{ students: { _count: "desc" } }, { createdAt: "asc" }],
          take: 12,
          select: {
            id: true,
            name: true,
            avatar: true,
            institution: { select: { name: true } },
            _count: { select: { students: true } },
          },
        }),
        prisma.institution.findMany({
          orderBy: [{ subscriptionActive: "desc" }, { name: "asc" }],
          select: { id: true, name: true, subscriptionActive: true },
        }),
      ]);

    const counselorsList = counselorRows
      .filter((c) => c.name && c.name.trim().length > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar ?? null,
        institutionName: c.institution?.name ?? null,
        studentCount: c._count.students,
      }));

    const partners = partnerRows
      .filter((p) => p.name && p.name.trim().length > 0)
      .map((p) => ({ id: p.id, name: p.name, active: p.subscriptionActive }));

    return NextResponse.json({
      stats: {
        students,
        counselors,
        institutions: institutionsCount,
        modulesDone,
      },
      counselors: counselorsList,
      partners,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat data landing" },
      { status: 500 }
    );
  }
}
