import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth-guard";

export const dynamic = "force-dynamic";


const ACTIVE_BOOKING = ["PENDING", "APPROVED"] as const;

type ScheduleType = "INDIVIDUAL" | "GROUP";




export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
  }

  const now = new Date();

  if (session.role === "COUNSELOR") {
    const schedules = await prisma.counselingSchedule.findMany({
      where: { counselorId: session.userId },
      orderBy: { startTime: "asc" },
      include: {
        bookings: {
          orderBy: { createdAt: "asc" },
          include: { student: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({
      role: "COUNSELOR",
      schedules: schedules.map((s) => ({
        id: s.id,
        type: s.type,
        maxCapacity: s.maxCapacity,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        meetLink: `/room/${s.id}`,
        location: s.location,
        phone: s.phone,
        status: s.status,
        bookedCount: s.bookings.filter((b) => ACTIVE_BOOKING.includes(b.status as never)).length,
        bookings: s.bookings.map((b) => ({
          id: b.id,
          studentId: b.studentId,
          studentName: b.student?.name ?? null,
          topic: b.topic,
          status: b.status,
          notes: b.notes,
          approvalMessage: b.approvalMessage,
          createdAt: b.createdAt.toISOString(),
        })),
      })),
    });
  }

  // Ambil data konselor terpilih / institusi siswa untuk membatasi kuota slot pengerjaan
  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { institutionId: true, counselorId: true }
  });

  const counselorFilter = student?.counselorId
    ? { counselorId: student.counselorId }
    : student?.institutionId
      ? { counselor: { institutionId: student.institutionId } }
      : {};

  const schedules = await prisma.counselingSchedule.findMany({
    where: {
      OR: [
        {
          ...counselorFilter,
          startTime: { gte: now },
          status: { not: "CANCELLED" }
        },
        {
          bookings: { some: { studentId: session.userId } }
        }
      ]
    },
    orderBy: { startTime: "asc" },
    include: {
      counselor: { select: { name: true } },
      bookings: {
        select: {
          id: true,
          studentId: true,
          status: true,
          approvalMessage: true,
        },
      },
    },
  });

  return NextResponse.json({
    role: "STUDENT",
    schedules: schedules.map((s) => {
      const active = s.bookings.filter((b) => ACTIVE_BOOKING.includes(b.status as never));
      const myBooking = s.bookings.find((b) => b.studentId === session.userId) ?? null;
      const isApproved = myBooking?.status === "APPROVED";
      return {
        id: s.id,
        type: s.type,
        counselorName: s.counselor?.name ?? null,
        maxCapacity: s.maxCapacity,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        bookedCount: active.length,
        isFull: active.length >= s.maxCapacity,
        myBookingStatus: myBooking?.status ?? null,
        myBookingId: myBooking?.id ?? null,
        
        meetLink: isApproved ? `/room/${s.id}` : null,
        location: isApproved ? s.location : null,
        phone: isApproved ? s.phone : null,
        approvalMessage: isApproved ? (myBooking?.approvalMessage ?? null) : null,
      };
    }),
  });
}


export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const type: ScheduleType = body?.type === "GROUP" ? "GROUP" : "INDIVIDUAL";
  const start = new Date(body?.startTime);
  const end = new Date(body?.endTime);
  const maxCapacity =
    Number.isInteger(body?.maxCapacity) && body.maxCapacity > 0
      ? Math.min(body.maxCapacity, 50)
      : type === "GROUP"
        ? 5
        : 1;
  const location = typeof body?.location === "string" ? body.location.trim() || null : null;
  const phone = typeof body?.phone === "string" ? body.phone.trim() || null : null;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Waktu tidak valid" }, { status: 400 });
  }
  if (end <= start) {
    return NextResponse.json({ error: "Waktu selesai harus setelah waktu mulai" }, { status: 400 });
  }

  const schedule = await prisma.counselingSchedule.create({
    data: {
      counselorId: session.userId,
      type,
      maxCapacity,
      startTime: start,
      endTime: end,
      location,
      phone,
    },
  });

  return NextResponse.json({ id: schedule.id }, { status: 201 });
}


export async function DELETE(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  const schedule = await prisma.counselingSchedule.findUnique({
    where: { id },
    select: { counselorId: true },
  });
  if (!schedule || schedule.counselorId !== session.userId) {
    return NextResponse.json({ error: "Slot tidak ditemukan" }, { status: 404 });
  }

  await prisma.counselingSchedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
