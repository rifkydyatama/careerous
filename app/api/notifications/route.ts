import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/notifications?userId=...&limit=20
// Mengembalikan daftar notifikasi terbaru + jumlah belum dibaca.
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat notifikasi" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications  body: { userId, id? , markAllRead? }
// Tandai satu notifikasi (id) atau semua (markAllRead) sebagai dibaca.
export async function PATCH(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = typeof body?.userId === "string" ? body.userId : null;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    if (body?.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (typeof body?.id === "string") {
      await prisma.notification.updateMany({
        where: { id: body.id, userId },
        data: { read: true },
      });
    } else {
      return NextResponse.json(
        { error: "Sertakan id atau markAllRead" },
        { status: 400 }
      );
    }

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ ok: true, unreadCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui notifikasi" },
      { status: 500 }
    );
  }
}
