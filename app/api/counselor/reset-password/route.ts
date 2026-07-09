import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth-guard";
import { hashPassword } from "../../../../lib/portal-session";


export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!studentId) {
    return NextResponse.json({ error: "ID siswa wajib diisi" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi baru minimal 8 karakter" },
      { status: 400 }
    );
  }

  try {
    const counselor = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { institutionId: true },
    });

    if (!counselor || !counselor.institutionId) {
      return NextResponse.json(
        { error: "Konselor tidak terafiliasi dengan sekolah mana pun" },
        { status: 403 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, role: true, institutionId: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Konselor hanya diperbolehkan mereset sandi siswa" },
        { status: 403 }
      );
    }

    if (student.institutionId !== counselor.institutionId) {
      return NextResponse.json(
        { error: "Siswa ini tidak terdaftar di institusi sekolah Anda" },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: studentId },
      data: { passwordHash },
    });

    return NextResponse.json({
      ok: true,
      message: `Kata sandi ${student.name ?? student.email} berhasil direset.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mereset kata sandi" },
      { status: 500 }
    );
  }
}
