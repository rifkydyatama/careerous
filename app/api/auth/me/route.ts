import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionCookieName, parseSessionToken, hashPassword } from "../../../../lib/portal-session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;

  if (!token) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const session = parseSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
          select: {
            id: true,
            name: true,
            subscriptionActive: true,
            subscriptionExpiresAt: true,
          },
        },
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

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil sesi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;

  if (!token) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const session = parseSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const email = typeof body?.email === "string" ? body.email.trim() : undefined;
  const phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;
  const avatar = typeof body?.avatar === "string" ? body.avatar : undefined;
  const password = typeof body?.password === "string" ? body.password : undefined;

  if (password !== undefined && password.length < 8) {
    return NextResponse.json({ error: "Kata sandi baru minimal 8 karakter" }, { status: 400 });
  }

  try {
    const updateData: any = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    };

    if (password !== undefined) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan. Pastikan email tidak digunakan oleh orang lain." },
      { status: 500 }
    );
  }
}