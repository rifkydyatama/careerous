import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { generateCareerReport } from "../../../../../lib/career-report";
import { TOTAL_MODULES } from "../../../../../lib/modules";
import { getSession } from "@/lib/auth-guard";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
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

    const session = getSession(_request);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
    }

    const isSelf = session.userId === studentId;
    const isAdmin = session.role === "ADMIN";
    const isAssignedCounselor = session.role === "COUNSELOR" && student.counselorId === session.userId;

    if (!isSelf && !isAdmin && !isAssignedCounselor) {
      return NextResponse.json({ error: "Akses ditolak: Anda bukan konselor pendamping siswa ini" }, { status: 403 });
    }

    let report = await prisma.careerExplorationReport.findUnique({
      where: { studentId },
    });

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim());

    if (!report || (!report.isAiGenerated && hasApiKey)) {
      report = await generateCareerReport(studentId);
    }

    if (!report) {
      const completed = await prisma.journalProgress.count({
        where: { studentId, status: "COMPLETED" },
      });
      return NextResponse.json(
        {
          error: "Laporan belum tersedia",
          completed,
          total: TOTAL_MODULES,
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
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}
