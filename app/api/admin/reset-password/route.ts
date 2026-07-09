import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";
import { hashPassword } from "../../../../lib/portal-session";


export async function POST(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!userId) {
    return NextResponse.json({ error: "ID pengguna wajib diisi" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi baru minimal 8 karakter" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      ok: true,
      message: `Kata sandi ${user.name ?? user.email} berhasil direset.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mereset kata sandi" },
      { status: 500 }
    );
  }
}
