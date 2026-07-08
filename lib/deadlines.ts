// Logika sistem deadline modul (model tanggal absolut per modul).
//
// Aturan:
// - Tiap modul punya batas waktu absolut (tanggal & jam) yang diatur admin di ModuleContent.deadlineAt.
// - Saat batas terlewat & modul belum selesai: modul TERKUNCI dan siswa wajib mengisi moodboard
//   (perasaan + alasan) dalam masa grace (GRACE_HOURS). Setelah diisi, modul terbuka kembali dengan
//   perpanjangan +1 hari (EXTENSION_HOURS) dan konselor diberi tahu.
// - Jika grace habis tanpa moodboard, sistem otomatis melapor ke konselor untuk membukakan modul,
//   dan modul menunggu konselor membukanya (counselorUnlockModule).
//
// Konvensi lateCount: 0 = diatur tanggal absolut (fresh), 1 = terkunci menunggu moodboard (grace),
// 2 = grace habis & sudah dieskalasi ke konselor, 3 = diperpanjang +1 hari (relatif, tak dikunci ulang).
//
// Diproses oleh endpoint cron (/api/cron/deadlines) dan juga saat GET jurnal per-siswa (idempoten).

import { prisma } from "./prisma";
import { isPremiumEffective } from "./subscription";
import { getMood } from "./modules";
import { getModuleContents } from "./module-content";

export const GRACE_HOURS = 24; // waktu mengisi moodboard setelah batas terlewat
export const EXTENSION_HOURS = 24; // perpanjangan (+1 hari) setelah moodboard/konselor membuka

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

// Notifikasi konselor: siswa belum mengisi moodboard, mohon bukakan modul.
async function notifyCounselorsUnlock(
  counselors: CounselorRef[],
  studentId: string,
  studentName: string | null,
  moduleNumber: number
) {
  if (counselors.length === 0) return;
  const name = studentName?.trim() || "Seorang siswa";
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
  locks: number; // modul terkunci karena batas terlewat
  escalations: number; // eskalasi ke konselor (grace habis)
};

/**
 * Memproses deadline untuk satu siswa. Idempoten: tiap transisi hanya terjadi sekali karena
 * mengubah status / lateCount / lockedUntil.
 */
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

  // Sistem deadline otomatis adalah fitur Premium. Siswa Free tidak diproses.
  if (!isPremiumEffective(student.plan, student.institution)) return result;

  const journals = await prisma.journalProgress.findMany({ where: { studentId } });
  const contents = await getModuleContents(); // termasuk deadlineAt absolut per modul

  let counselors = counselorsCache;

  for (const journal of journals) {
    const moduleDeadline = contents.get(journal.weekNumber)?.deadlineAt ?? null;

    // Sinkronisasi tampilan: modul aktif yang masih "fresh" (lateCount 0) mengikuti tanggal absolut
    // terkini dari admin. Aman: lateCount 0 = belum masuk siklus telat.
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

    // A) Batas absolut terlewat pada modul terbuka -> kunci untuk moodboard (grace).
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
          body: `Kamu melewati batas waktu Modul ${journal.weekNumber}. Isi moodboard (perasaan & alasan) sebelum ${formatDateId(
            graceUntil
          )} untuk membuka modul kembali (+1 hari). Jika tidak, konselor akan diminta membukakannya.`,
          moduleNumber: journal.weekNumber,
        },
      });
      result.locks += 1;
      continue;
    }

    // B) Grace habis tanpa moodboard -> eskalasi ke konselor (sekali).
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

/**
 * Moodboard: siswa mengisi perasaan + alasan keterlambatan untuk membuka kembali modul terkunci
 * (masa grace). Modul terbuka kembali dengan perpanjangan +1 hari, konselor diberi tahu mood+alasan.
 */
export async function submitLateReason(
  studentId: string,
  weekNumber: number,
  reason: string,
  mood?: string | null
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const trimmed = reason.trim();
  if (!trimmed) {
    return { ok: false, error: "Alasan wajib diisi", status: 400 };
  }

  // Moodboard: perasaan siswa (opsional). Simpan hanya bila valid.
  const moodOption = getMood(mood);

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
  // Hanya modul yang terkunci karena batas & masih dalam masa grace yang bisa dibuka via moodboard.
  const isTempLocked =
    journal.status === "LOCKED" && journal.lockedUntil && journal.lockedUntil > now;
  if (!isTempLocked) {
    return { ok: false, error: "Modul tidak sedang menunggu moodboard", status: 409 };
  }

  const newDeadline = addHours(now, EXTENSION_HOURS);
  await prisma.journalProgress.update({
    where: { id: journal.id },
    data: {
      lateReason: trimmed,
      lateMood: moodOption?.key ?? null,
      status: "UNLOCKED",
      unlockedAt: now,
      deadlineAt: newDeadline,
      lockedUntil: null,
      lateCount: 3, // diperpanjang: tak dikunci ulang otomatis oleh batas absolut
    },
  });

  // Beri tahu konselor agar dapat menganalisis kendala siswa.
  const counselors = await getCounselors();
  if (counselors.length > 0) {
    const name = student.name?.trim() || "Seorang siswa";
    const preview = trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed;
    const moodText = moodOption
      ? ` Perasaan siswa: ${moodOption.emoji} ${moodOption.label}.`
      : "";
    await prisma.notification.createMany({
      data: counselors.map((counselor) => ({
        userId: counselor.id,
        type: "LATE_REASON",
        title: `${name} menjelaskan keterlambatan (Modul ${weekNumber})`,
        body: `Alasan keterlambatan: "${preview}".${moodText} Modul dibuka kembali (+1 hari). Pertimbangkan untuk melakukan pendampingan.`,
        moduleNumber: weekNumber,
        relatedStudentId: studentId,
      })),
    });
  }

  return { ok: true };
}

/**
 * Konselor membuka modul yang terkunci karena batas waktu (setelah eskalasi atau kapan pun).
 * Modul terbuka kembali dengan perpanjangan +1 hari; siswa diberi tahu.
 */
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
  // Hanya kunci akibat batas waktu (lateCount >= 1), bukan kunci urutan (modul sebelumnya belum selesai).
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

/**
 * Memproses deadline untuk semua siswa. Dipakai oleh endpoint cron.
 */
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
