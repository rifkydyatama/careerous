import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { TOTAL_MODULES, FREE_MODULE_LIMIT, isPremiumModule } from "../../../../lib/modules";
import { processStudentDeadlines, submitMoodDocument, counselorUnlockModule } from "../../../../lib/deadlines";
import { generateCareerReport } from "../../../../lib/career-report";
import { isPremiumEffective, premiumSource } from "../../../../lib/subscription";
import { getModuleContents, resolveModule, getModuleDeadline } from "../../../../lib/module-content";
import { requireRole, getSession } from "@/lib/auth-guard";

const TOTAL_WEEKS = TOTAL_MODULES;

type RouteContext = {
  params: Promise<{ studentId: string }>;
};



async function ensureJournalWeeks(
  studentId: string,
  premium: boolean,
  firstDeadline: Date | null
) {
  const existing = await prisma.journalProgress.findMany({
    where: { studentId },
    select: { weekNumber: true },
  });

  const existingWeeks = new Set(existing.map((item) => item.weekNumber));
  const now = new Date();
  const missing = [] as Array<{
    studentId: string;
    weekNumber: number;
    status: "LOCKED" | "UNLOCKED" | "COMPLETED";
    unlockedAt: Date | null;
    deadlineAt: Date | null;
  }>;

  for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
    if (!existingWeeks.has(week)) {
      const isFirst = week === 1;
      missing.push({
        studentId,
        weekNumber: week,
        status: isFirst ? "UNLOCKED" : "LOCKED",
        unlockedAt: isFirst ? now : null,
        deadlineAt: isFirst && premium ? firstDeadline : null,
      });
    }
  }

  if (missing.length > 0) {
    await prisma.journalProgress.createMany({
      data: missing,
      skipDuplicates: true,
    });
  }
}

function parseWeekNumber(value: unknown): number | null {
  if (Number.isInteger(value)) {
    return value as number;
  }
  return null;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        plan: true,
        institutionId: true,
        institution: {
          select: { name: true, subscriptionActive: true, subscriptionExpiresAt: true },
        },
        counselorId: true,
        counselor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json({ error: "User bukan siswa" }, { status: 400 });
    }

    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
    }

    const isSelf = session.userId === studentId;
    const isAdmin = session.role === "ADMIN";
    const isAssignedCounselor = session.role === "COUNSELOR" && student.counselorId === session.userId;

    if (!isSelf && !isAdmin && !isAssignedCounselor) {
      return NextResponse.json({ error: "Akses ditolak: Anda bukan konselor pendamping siswa ini" }, { status: 403 });
    }

    const premium = isPremiumEffective(student.plan, student.institution);
    const source = premiumSource(student.plan, student.institution);

    const firstDeadline = premium ? await getModuleDeadline(1, student.institutionId) : null;
    await ensureJournalWeeks(studentId, premium, firstDeadline);

    
    
    await processStudentDeadlines(studentId);

    const journals = await prisma.journalProgress.findMany({
      where: { studentId },
      orderBy: { weekNumber: "asc" },
    });

    const contents = await getModuleContents();

    let schoolDeadlineMap = new Map<number, Date | null>();
    if (premium && student.institutionId) {
      const schoolDeadlines = await prisma.institutionModuleDeadline.findMany({
        where: { institutionId: student.institutionId },
      });
      for (const sd of schoolDeadlines) {
        schoolDeadlineMap.set(sd.moduleNumber, sd.deadlineAt);
      }
    }

    const journalsWithGate = journals.map((journal) => {
      const meta = resolveModule(journal.weekNumber, contents);
      const overrideDeadline = schoolDeadlineMap.has(journal.weekNumber)
        ? schoolDeadlineMap.get(journal.weekNumber)
        : undefined;
      return {
        ...journal,
        deadlineAt: overrideDeadline !== undefined
          ? (overrideDeadline?.toISOString() ?? null)
          : (journal.deadlineAt?.toISOString() ?? null),
        premiumLocked: !premium && isPremiumModule(journal.weekNumber),
        title: meta?.title ?? null,
        prompt: meta?.prompt ?? null,
        introduction: meta?.introduction ?? null,
        prompts: meta?.prompts ?? [],
        phaseLabel: meta?.phaseLabel ?? null,
      };
    });

    const reportExists = await prisma.careerExplorationReport.findUnique({
      where: { studentId },
      select: { id: true },
    });

    return NextResponse.json({
      studentId,
      totalWeeks: TOTAL_WEEKS,
      plan: student.plan,
      premium,
      premiumSource: source,
      serverTime: new Date().toISOString(),
      institutionName: student.institution?.name ?? null,
      freeModuleLimit: FREE_MODULE_LIMIT,
      hasReport: Boolean(reportExists),
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        avatar: (student as any).avatar ?? null,
      },
      counselor: student.counselor ? {
        id: student.counselor.id,
        name: student.counselor.name,
        email: student.counselor.email,
        phone: student.counselor.phone,
        avatar: student.counselor.avatar,
      } : null,
      journals: journalsWithGate,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil jurnal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const weekNumber = parseWeekNumber(body?.weekNumber);
  const reflectionText =
    typeof body?.reflectionText === "string" ? body.reflectionText.trim() : "";
  const evidenceImageUrl =
    typeof body?.evidenceImageUrl === "string" ? body.evidenceImageUrl.trim() : null;

  if (!weekNumber || weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
    return NextResponse.json({ error: "Nomor modul harus 1-12" }, { status: 400 });
  }

  if (!reflectionText) {
    return NextResponse.json({ error: "Refleksi wajib diisi" }, { status: 400 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        role: true,
        plan: true,
        institution: {
          select: { subscriptionActive: true, subscriptionExpiresAt: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json({ error: "User bukan siswa" }, { status: 400 });
    }

    const premium = isPremiumEffective(student.plan, student.institution);

    
    if (!premium && isPremiumModule(weekNumber)) {
      return NextResponse.json(
        { error: "Modul ini hanya tersedia untuk paket Premium" },
        { status: 402 }
      );
    }

    const firstDeadline = premium ? await getModuleDeadline(1) : null;
    await ensureJournalWeeks(studentId, premium, firstDeadline);

    const current = await prisma.journalProgress.findUnique({
      where: { studentId_weekNumber: { studentId, weekNumber } },
    });

    if (!current) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    if (current.status === "LOCKED") {
      const message = current.lockedUntil
        ? "Modul masih terkunci sementara"
        : "Selesaikan modul sebelumnya terlebih dahulu";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    const now = new Date();
    
    const nextDeadline = premium ? await getModuleDeadline(weekNumber + 1) : null;

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.journalProgress.update({
        where: { id: current.id },
        data: {
          reflectionText,
          evidenceImageUrl: evidenceImageUrl || null,
          status: "COMPLETED",
        },
      });

      if (weekNumber < TOTAL_WEEKS) {
        await tx.journalProgress.updateMany({
          where: {
            studentId,
            weekNumber: weekNumber + 1,
            status: "LOCKED",
            lockedUntil: null, 
          },
          data: {
            status: "UNLOCKED",
            unlockedAt: now,
            
            deadlineAt: nextDeadline,
            lateCount: 0,
          },
        });
      }

      return saved;
    });

    
    if (weekNumber === TOTAL_WEEKS) {
      try {
        const report = await generateCareerReport(studentId);
        if (report) {
          await prisma.notification.create({
            data: {
              userId: studentId,
              type: "REPORT_READY",
              title: "Career Exploration Report siap",
              body: "Selamat! Kamu menyelesaikan seluruh 12 modul. Laporan eksplorasi kariermu sudah tersedia.",
            },
          });
        }
      } catch {
        
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui modul" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const weekNumber = parseWeekNumber(body?.weekNumber);

  if (!weekNumber || weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
    return NextResponse.json({ error: "Nomor modul harus 1-12" }, { status: 400 });
  }

  
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak: Sesi tidak valid" }, { status: 401 });
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      role: true,
      plan: true,
      counselorId: true,
      institution: {
        select: { subscriptionActive: true, subscriptionExpiresAt: true },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  if (student.role !== "STUDENT") {
    return NextResponse.json({ error: "User bukan siswa" }, { status: 400 });
  }

  const isAdmin = session.role === "ADMIN";
  const isAssignedCounselor = session.role === "COUNSELOR" && student.counselorId === session.userId;

  if (!isAdmin && !isAssignedCounselor) {
    return NextResponse.json({ error: "Akses ditolak: Anda bukan konselor pendamping siswa ini" }, { status: 403 });
  }

  if (body?.unlock === true) {
    try {
      const result = await counselorUnlockModule(studentId, weekNumber);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error ?? "Gagal membuka modul" },
          { status: result.status ?? 400 }
        );
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      return NextResponse.json({ error: "Gagal membuka modul" }, { status: 500 });
    }
  }

  const counselorFeedback =
    typeof body?.counselorFeedback === "string" ? body.counselorFeedback.trim() : "";

  if (!counselorFeedback) {
    return NextResponse.json({ error: "Umpan balik wajib diisi" }, { status: 400 });
  }

  try {

    
    if (!isPremiumEffective(student.plan, student.institution) && weekNumber > FREE_MODULE_LIMIT) {
      return NextResponse.json(
        { error: "Feedback modul 5-12 hanya tersedia pada akun Premium" },
        { status: 402 }
      );
    }

    const journal = await prisma.journalProgress.findUnique({
      where: { studentId_weekNumber: { studentId, weekNumber } },
    });

    if (!journal) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    if (!journal.reflectionText) {
      return NextResponse.json({ error: "Modul belum dikerjakan" }, { status: 409 });
    }

    const updated = await prisma.journalProgress.update({
      where: { id: journal.id },
      data: { counselorFeedback },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan feedback" }, { status: 500 });
  }
}



export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const weekNumber = parseWeekNumber(body?.weekNumber);
  const documentUrl = typeof body?.documentUrl === "string" ? body.documentUrl : "";
  const lateMood = typeof body?.lateMood === "string" ? body.lateMood : "";
  const lateReason = typeof body?.lateReason === "string" ? body.lateReason : "";

  if (!weekNumber || weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
    return NextResponse.json({ error: "Nomor modul harus 1-12" }, { status: 400 });
  }

  try {
    const result = await submitMoodDocument(studentId, weekNumber, documentUrl, lateMood, lateReason);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Gagal mengirim dokumen" },
        { status: result.status ?? 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim dokumen" }, { status: 500 });
  }
}
