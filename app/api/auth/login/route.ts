import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getDashboardPath,
  normalizeEmail,
  normalizeRole,
} from "../../../../lib/portal-auth";
import {
  buildSessionCookie,
  createSessionForUser,
  verifyPassword,
} from "../../../../lib/portal-session";

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const role = normalizeRole(body?.role);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json(
      { error: "Kata sandi wajib diisi" },
      { status: 400 }
    );
  }

  if (!role) {
    return NextResponse.json({ error: "Peran tidak valid" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }

    if (user.role !== role) {
      return NextResponse.json(
        { error: "Peran akun tidak sesuai" },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Akun belum memiliki kata sandi. Silakan daftar akun terlebih dahulu." },
        { status: 409 }
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo: getDashboardPath(user.role, user.id),
    });

    response.cookies.set(buildSessionCookie(createSessionForUser(user.id, user.role)));

    return response;
  } catch {
    return NextResponse.json(
      { error: "Gagal melakukan login" },
      { status: 500 }
    );
  }
}
