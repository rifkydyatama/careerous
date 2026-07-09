import { prisma } from "./prisma";
import { isPremiumEffective } from "./subscription";
import { getModuleContents } from "./module-content";

export const GRACE_HOURS = 24;
export const EXTENSION_HOURS = 24;

const HOUR_MS = 60 * 60 * 1000;

function addHours(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * HOUR_MS);
}

function formatDateId(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

type CounselorRef = { id: string };

async function getCounselors(): Promise<CounselorRef[]> {
  return prisma.user.findMany({
    where: { role: "COUNSELOR" },
    select: { id: true },
  });
}

async function notifyCounselorsUnlock(
  counselors: CounselorRef[],
  studentId: string,
  studentName: string | null,
  moduleNumber: number
): Promise<void> {
  const name = studentName?.trim() || "Siswa";
  await prisma.notification.createMany({
    data: counselors.map((counselor) => ({
      userId: counselor.id,
      type: "CHECK_IN",
      title: `Modul ${moduleNumber} ${name} perlu dibuka`,
      body: `${name} melewati batas waktu Modul ${moduleNumber} dan belum mengisi moodboard. Mohon tinjau dan buka modulnya.`,
      moduleNumber,
      relatedStudentId: studentId,
    })),
  });
}

type ProcessResult = {
  locks: number;
  escalations: number;
};

export async function processStudentDeadlines(
  studentId: string,
  counselorsCache?: CounselorRef[]
): Promise<ProcessResult> {
  const now = new Date();
  const result: ProcessResult = { locks: 0, escalations: 0 };

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      role: true,
      plan: true,
      institution: {
        select: { subscriptionActive: true, subscriptionExpiresAt: true },
      },
    },
  });
  if (!student || student.role !== "STUDENT") return result;

  if (!isPremiumEffective(student.plan, student.institution)) return result;

  const journals = await prisma.journalProgress.findMany({ where: { studentId } });
  const contents = await getModuleContents();

  let counselors = counselorsCache;

  for (const journal of journals) {
    const moduleDeadline = contents.get(journal.weekNumber)?.deadlineAt ?? null;

    if (journal.status === "UNLOCKED" && journal.lateCount === 0) {
      const cur = journal.deadlineAt ? journal.deadlineAt.getTime() : null;
      const want = moduleDeadline ? moduleDeadline.getTime() : null;
      if (cur !== want) {
        await prisma.journalProgress.update({
          where: { id: journal.id },
          data: { deadlineAt: moduleDeadline },
        });
        journal.deadlineAt = moduleDeadline;
      }
    }

    if (
      journal.status === "UNLOCKED" &&
      journal.lateCount === 0 &&
      journal.deadlineAt &&
      journal.deadlineAt <= now
    ) {
      const graceUntil = addHours(now, GRACE_HOURS);
      await prisma.journalProgress.update({
        where: { id: journal.id },
        data: {
          status: "LOCKED",
          lockedUntil: graceUntil,
          lateCount: 1,
          deadlineAt: null,
          lateReason: null,
          lateMood: null,
        },
      });
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: "MODULE_LOCKED",
          title: `Batas waktu Modul ${journal.weekNumber} terlewat`,
          body: `Kamu melewati batas waktu Modul ${journal.weekNumber}. Unggah dokumen mood board sebelum ${formatDateId(
            graceUntil
          )} untuk membuka modul kembali (+1 hari). Jika tidak, maka modul akan terblokir.`,
          moduleNumber: journal.weekNumber,
        },
      });
      result.locks += 1;
      continue;
    }

    if (
      journal.status === "LOCKED" &&
      journal.lateCount === 1 &&
      journal.lockedUntil &&
      journal.lockedUntil <= now
    ) {
      if (!counselors) counselors = await getCounselors();
      await notifyCounselorsUnlock(counselors, studentId, student.name, journal.weekNumber);
      await prisma.journalProgress.update({
        where: { id: journal.id },
        data: { lateCount: 2 },
      });
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: "MODULE_LOCKED",
          title: `Modul ${journal.weekNumber} menunggu konselor`,
          body: `Kamu belum mengisi moodboard tepat waktu. Konselor sudah diberi tahu dan akan membuka Modul ${journal.weekNumber} untukmu.`,
          moduleNumber: journal.weekNumber,
        },
      });
      result.escalations += 1;
      continue;
    }
  }

  return result;
}

export async function submitMoodDocument(
  studentId: string,
  weekNumber: number,
  documentUrl: string
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const url = documentUrl.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, error: "Dokumen wajib diunggah", status: 400 };
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true, role: true },
  });
  if (!student || student.role !== "STUDENT") {
    return { ok: false, error: "Siswa tidak ditemukan", status: 404 };
  }

  const journal = await prisma.journalProgress.findUnique({
    where: { studentId_weekNumber: { studentId, weekNumber } },
  });
  if (!journal) {
    return { ok: false, error: "Modul tidak ditemukan", status: 404 };
  }

  const now = new Date();
  const isTempLocked =
    journal.status === "LOCKED" && journal.lockedUntil && journal.lockedUntil > now;
  if (!isTempLocked) {
    return { ok: false, error: "Modul tidak sedang menunggu mood board", status: 409 };
  }

  const newDeadline = addHours(now, EXTENSION_HOURS);
  await prisma.journalProgress.update({
    where: { id: journal.id },
    data: {
      moodDocumentUrl: url,
      lateReason: null,
      lateMood: null,
      status: "UNLOCKED",
      unlockedAt: now,
      deadlineAt: newDeadline,
      lockedUntil: null,
      lateCount: 3,
    },
  });

  const counselors = await getCounselors();
  if (counselors.length > 0) {
    const name = student.name?.trim() || "Seorang siswa";
    await prisma.notification.createMany({
      data: counselors.map((counselor) => ({
        userId: counselor.id,
        type: "MOOD_DOCUMENT",
        title: `${name} mengunggah dokumen mood board (Modul ${weekNumber})`,
        body: `${name} mengunggah dokumen untuk membuka Modul ${weekNumber}. Modul dibuka kembali (+1 hari). Silakan tinjau dokumennya.`,
        moduleNumber: weekNumber,
        relatedStudentId: studentId,
      })),
    });
  }

  return { ok: true };
}

export async function counselorUnlockModule(
  studentId: string,
  weekNumber: number
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const journal = await prisma.journalProgress.findUnique({
    where: { studentId_weekNumber: { studentId, weekNumber } },
  });
  if (!journal) {
    return { ok: false, error: "Modul tidak ditemukan", status: 404 };
  }
  if (journal.status !== "LOCKED") {
    return { ok: false, error: "Modul tidak sedang terkunci", status: 409 };
  }
  if (journal.lateCount < 1) {
    return { ok: false, error: "Modul terkunci karena urutan, bukan batas waktu", status: 409 };
  }

  const now = new Date();
  const newDeadline = addHours(now, EXTENSION_HOURS);
  await prisma.journalProgress.update({
    where: { id: journal.id },
    data: {
      status: "UNLOCKED",
      unlockedAt: now,
      deadlineAt: newDeadline,
      lockedUntil: null,
      lateCount: 3,
    },
  });
  await prisma.notification.create({
    data: {
      userId: studentId,
      type: "MODULE_REOPENED",
      title: `Konselor membuka Modul ${weekNumber}`,
      body: `Modul ${weekNumber} telah dibuka konselor. Selesaikan sebelum ${formatDateId(
        newDeadline
      )}.`,
      moduleNumber: weekNumber,
    },
  });

  return { ok: true };
}

export async function processAllDeadlines(): Promise<
  ProcessResult & { studentsProcessed: number }
> {
  const counselors = await getCounselors();
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });

  const total: ProcessResult & { studentsProcessed: number } = {
    locks: 0,
    escalations: 0,
    studentsProcessed: students.length,
  };

  for (const student of students) {
    const res = await processStudentDeadlines(student.id, counselors);
    total.locks += res.locks;
    total.escalations += res.escalations;
  }

  return total;
}
