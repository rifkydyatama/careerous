import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { TOTAL_MODULES } from "../../../../lib/modules";
import { processAllDeadlines } from "../../../../lib/deadlines";
import { isPremiumEffective, premiumSource } from "../../../../lib/subscription";

const TOTAL_WEEKS = TOTAL_MODULES;

function serializeAssessment(
  assessment:
    | {
        id: string;
        studentId: string;
        riasecRealistic: number;
        riasecInvestigative: number;
        riasecArtistic: number;
        riasecSocial: number;
        riasecEnterprising: number;
        riasecConventional: number;
        riasecTop3: string | null;
        learningStyle: string;
        createdAt: Date;
      }
    | null
) {
  if (!assessment) {
    return null;
  }

  return {
    id: assessment.id,
    studentId: assessment.studentId,
    riasecRealistic: assessment.riasecRealistic,
    riasecInvestigative: assessment.riasecInvestigative,
    riasecArtistic: assessment.riasecArtistic,
    riasecSocial: assessment.riasecSocial,
    riasecEnterprising: assessment.riasecEnterprising,
    riasecConventional: assessment.riasecConventional,
    riasecTop3: assessment.riasecTop3,
    learningStyle: assessment.learningStyle,
    createdAt: assessment.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    // Pastikan status deadline mutakhir sebelum konselor membaca data.
    await processAllDeadlines();

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        institution: {
          select: { name: true, subscriptionActive: true, subscriptionExpiresAt: true },
        },
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            studentId: true,
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
        },
        journalProgress: {
          orderBy: { weekNumber: "asc" },
          select: {
            id: true,
            weekNumber: true,
            status: true,
            reflectionText: true,
            evidenceImageUrl: true,
            counselorFeedback: true,
            deadlineAt: true,
            lockedUntil: true,
            lateCount: true,
            lateReason: true,
            lateMood: true,
            moodDocumentUrl: true,
            updatedAt: true,
          },
        },
      },
    });

    const now = Date.now();
    const payload = students.map((student) => {
      const completedCount = student.journalProgress.filter(
        (journal) => journal.status === "COMPLETED"
      ).length;
      const pendingFeedback = student.journalProgress.filter(
        (journal) =>
          journal.status === "COMPLETED" &&
          !journal.counselorFeedback &&
          journal.reflectionText
      ).length;

      // Tanda keterlambatan & kunci untuk pendampingan konselor.
      const lateModules = student.journalProgress.filter(
        (journal) => journal.status === "UNLOCKED" && journal.lateCount > 0
      ).length;
      const lockedModules = student.journalProgress.filter(
        (journal) =>
          journal.status === "LOCKED" &&
          journal.lockedUntil &&
          journal.lockedUntil.getTime() > now
      ).length;

      const journals = student.journalProgress.map((journal) => ({
        ...journal,
        deadlineAt: journal.deadlineAt ? journal.deadlineAt.toISOString() : null,
        lockedUntil: journal.lockedUntil ? journal.lockedUntil.toISOString() : null,
        updatedAt: journal.updatedAt ? journal.updatedAt.toISOString() : undefined,
      }));

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        plan: student.plan,
        premium: isPremiumEffective(student.plan, student.institution),
        premiumSource: premiumSource(student.plan, student.institution),
        institutionName: student.institution?.name ?? null,
        latestAssessment: serializeAssessment(student.assessments[0] ?? null),
        totalWeeks: TOTAL_WEEKS,
        completedCount,
        pendingFeedback,
        lateModules,
        lockedModules,
        journals,
      };
    });

    return NextResponse.json({ totalWeeks: TOTAL_WEEKS, students: payload });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat data siswa" },
      { status: 500 }
    );
  }
}
