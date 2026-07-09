import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth-guard";

export const dynamic = "force-dynamic";

const ACTIVE_BOOKING = ["PENDING", "APPROVED"];

function formatId(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

// POST /api/counseling/bookings — siswa memesan slot. body: { scheduleId, topic }
export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const scheduleId = typeof body?.scheduleId === "string" ? body.scheduleId : "";
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (!scheduleId) {
    return NextResponse.json({ error: "Slot wajib dipilih" }, { status: 400 });
  }
  if (!topic) {
    return NextResponse.json({ error: "Topik konseling wajib diisi" }, { status: 400 });
  }

  const schedule = await prisma.counselingSchedule.findUnique({
    where: { id: scheduleId },
    include: { bookings: { select: { studentId: true, status: true } } },
  });
  if (!schedule || schedule.status === "CANCELLED") {
    return NextResponse.json({ error: "Slot tidak ditemukan" }, { status: 404 });
  }
  if (schedule.startTime <= new Date()) {
    return NextResponse.json({ error: "Slot sudah lewat" }, { status: 409 });
  }

  const active = schedule.bookings.filter((b) => ACTIVE_BOOKING.includes(b.status));
  if (active.some((b) => b.studentId === session.userId)) {
    return NextResponse.json({ error: "Kamu sudah memesan slot ini" }, { status: 409 });
  }
  if (active.length >= schedule.maxCapacity) {
    return NextResponse.json({ error: "Slot sudah penuh" }, { status: 409 });
  }

  try {
    await prisma.counselingBooking.create({
      data: { scheduleId, studentId: session.userId, topic, status: "PENDING" },
    });
  } catch {
    // Unik (scheduleId, studentId): booking lama (mis. REJECTED) mungkin masih ada.
    await prisma.counselingBooking.update({
      where: { scheduleId_studentId: { scheduleId, studentId: session.userId } },
      data: { topic, status: "PENDING" },
    });
  }

  // Beri tahu konselor pemilik slot.
  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });
  const name = student?.name?.trim() || "Seorang siswa";
  await prisma.notification.create({
    data: {
      userId: schedule.counselorId,
      type: "BOOKING",
      title: `Permintaan konseling dari ${name}`,
      body: `${name} memesan sesi ${formatId(schedule.startTime)}. Topik: "${topic}". Mohon tinjau.`,
      relatedStudentId: session.userId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

// PATCH /api/counseling/bookings — ubah status booking.
// Konselor: { id, status: APPROVED|REJECTED, approvalMessage? }. Siswa: { id, status: CANCELLED }.
export async function PATCH(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  const booking = await prisma.counselingBooking.findUnique({
    where: { id },
    include: {
      schedule: {
        select: {
          counselorId: true,
          startTime: true,
          meetLink: true,
          location: true,
          phone: true,
        },
      },
    },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  // Siswa membatalkan booking miliknya.
  if (session.role === "STUDENT") {
    if (booking.studentId !== session.userId || status !== "CANCELLED") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }
    await prisma.counselingBooking.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ ok: true });
  }

  // Konselor menyetujui / menolak booking pada slotnya.
  if (session.role === "COUNSELOR") {
    if (booking.schedule.counselorId !== session.userId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const approvalMessage = typeof body?.approvalMessage === "string" ? body.approvalMessage.trim() || null : null;
    const notes = typeof body?.notes === "string" ? body.notes.trim() : undefined;

    await prisma.counselingBooking.update({
      where: { id },
      data: {
        status,
        ...(approvalMessage !== null ? { approvalMessage } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    // Beri tahu siswa — sertakan info komunikasi jika disetujui.
    if (status === "APPROVED") {
      const schedule = booking.schedule;
      const commParts: string[] = [];
      commParts.push("Konselor menyetujui permintaan konselingmu! 🎉");
      if (schedule.meetLink) commParts.push(`🎥 Video Call: ${schedule.meetLink}`);
      if (schedule.phone) commParts.push(`📞 Telepon/WA: ${schedule.phone}`);
      if (schedule.location) commParts.push(`📍 Lokasi: ${schedule.location}`);
      if (approvalMessage) commParts.push(`💬 Pesan: ${approvalMessage}`);
      if (!schedule.meetLink && !schedule.phone && !schedule.location) {
        commParts.push("Sampai jumpa di sesi konseling!");
      }

      await prisma.notification.create({
        data: {
          userId: booking.studentId,
          type: "BOOKING",
          title: `Sesi konseling ${formatId(booking.schedule.startTime)} disetujui ✅`,
          body: commParts.join("\n"),
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: booking.studentId,
          type: "BOOKING",
          title: `Permintaan konseling ${formatId(booking.schedule.startTime)} ditolak`,
          body: "Konselor belum dapat menerima permintaan konselingmu. Silakan pilih slot lain.",
        },
      });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
}
