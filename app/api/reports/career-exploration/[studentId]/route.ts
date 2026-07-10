import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { generateCareerReport } from "../../../../../lib/career-report";
import { TOTAL_MODULES } from "../../../../../lib/modules";
import { getSession } from "@/lib/auth-guard";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, role: true, counselorId: true },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
    }

    const isSelf = session.userId === studentId;
    const isAdmin = session.role === "ADMIN";
    const isAssignedCounselor =
      session.role === "COUNSELOR" && student.counselorId === session.userId;

    if (!isSelf && !isAdmin && !isAssignedCounselor) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda bukan konselor pendamping siswa ini" },
        { status: 403 }
      );
    }

    // Fetch assessment for display purposes (RIASEC + Learning Style)
    const assessment = await prisma.assessment.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: {
        riasecRealistic: true,
        riasecInvestigative: true,
        riasecArtistic: true,
        riasecSocial: true,
        riasecEnterprising: true,
        riasecConventional: true,
        riasecTop3: true,
        learningStyle: true,
        createdAt: true,
      },
    });

    let report = await prisma.careerExplorationReport.findUnique({
      where: { studentId },
    });

    // Explicit refresh requested (e.g. user clicked "Minta Ulang AI")
    const wantsRefresh = request.nextUrl.searchParams.get("refresh") === "true";

    // Only generate/regenerate in two cases:
    // 1. No report exists yet
    // 2. User explicitly requested a refresh (prevents Gemini quota exhaustion on every page load)
    if (!report || wantsRefresh) {
      report = await generateCareerReport(studentId);
    }

    if (!report) {
      // Return progress info so the UI can show a meaningful "not ready" state
      const completed = await prisma.journalProgress.count({
        where: { studentId, status: "COMPLETED" },
      });
      return NextResponse.json(
        {
          error: "Laporan belum tersedia",
          completed,
          total: TOTAL_MODULES,
          hasAssessment: Boolean(assessment),
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      report: {
        ...report,
        dominantThemes: report.dominantThemes
          ? report.dominantThemes.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        generatedAt: report.generatedAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      },
      student: { id: student.id, name: student.name },
      assessment: assessment
        ? {
            ...assessment,
            createdAt: assessment.createdAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Career report GET error:", error);
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}
