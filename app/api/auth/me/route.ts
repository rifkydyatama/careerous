import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionCookieName, parseSessionToken } from "../../../../lib/portal-session";

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