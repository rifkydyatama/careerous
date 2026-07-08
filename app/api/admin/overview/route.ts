import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";
import { isInstitutionSubscribed } from "../../../../lib/subscription";

// GET /api/admin/overview — statistik & monitoring seluruh sistem (admin only).
export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const [
      students,
      counselors,
      admins,
      institutions,
      completedModules,
      reports,
      premiumUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "COUNSELOR" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.institution.findMany({
        select: { subscriptionActive: true, subscriptionExpiresAt: true },
      }),
      prisma.journalProgress.count({ where: { status: "COMPLETED" } }),
      prisma.careerExplorationReport.count(),
      prisma.user.count({ where: { role: "STUDENT", plan: "PREMIUM" } }),
    ]);

    const subscribedInstitutions = institutions.filter((i) =>
      isInstitutionSubscribed(i)
    ).length;

    return NextResponse.json({
      stats: {
        students,
        counselors,
        admins,
        institutions: institutions.length,
        subscribedInstitutions,
        completedModules,
        reports,
        premiumUsers,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
