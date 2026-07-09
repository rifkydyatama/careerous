import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getDashboardPath,
  normalizeEmail,
  normalizeRole,
  type PortalRole,
} from "../../../../lib/portal-auth";
import {
  buildSessionCookie,
  createSessionForUser,
  hashPassword,
} from "../../../../lib/portal-session";

const TOTAL_WEEKS = 12;

async function ensureJournalWeeks(studentId: string) {
  const existing = await prisma.journalProgress.findMany({
    where: { studentId },
    select: { weekNumber: true },
  });

  const existingWeeks = new Set(existing.map((item) => item.weekNumber));
  const missing = [] as Array<{
    studentId: string;
    weekNumber: number;
    status: "LOCKED" | "UNLOCKED" | "COMPLETED";
  }>;

  for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
    if (!existingWeeks.has(week)) {
      missing.push({
        studentId,
        weekNumber: week,
        status: week === 1 ? "UNLOCKED" : "LOCKED",
      });
    }
  }

  if (missing.length > 0) {
    await prisma.journalProgress.createMany({
      data: missing,
      skipDuplicates: true,
    });
  }
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const role = normalizeRole(body?.role);
  const password = typeof body?.password === "string" ? body.password : "";
  const institutionName =
    typeof body?.institutionName === "string" ? body.institutionName.trim() : "";
  
  const institutionIdInput =
    typeof body?.institutionId === "string" ? body.institutionId.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi minimal 8 karakter" },
      { status: 400 }
    );
  }

  if (!role) {
    return NextResponse.json({ error: "Peran tidak valid" }, { status: 400 });
  }

  
  if (role === "ADMIN") {
    return NextResponse.json({ error: "Peran tidak valid" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    const passwordHash = await hashPassword(password);

    
    
    let institutionId: string | null = null;
    if (institutionIdInput) {
      const byId = await prisma.institution.findUnique({
        where: { id: institutionIdInput },
        select: { id: true },
      });
      if (!byId) {
        return NextResponse.json(
          { error: "Sekolah yang dipilih tidak ditemukan" },
          { status: 400 }
        );
      }
      institutionId = byId.id;
    } else if (institutionName) {
      const existingInstitution = await prisma.institution.findFirst({
        where: { name: { equals: institutionName, mode: "insensitive" } },
        select: { id: true },
      });
      institutionId = existingInstitution
        ? existingInstitution.id
        : (
            await prisma.institution.create({
              data: { name: institutionName },
              select: { id: true },
            })
          ).id;
    }

    
    if (role === "STUDENT" && !institutionId) {
      return NextResponse.json(
        { error: "Silakan pilih sekolah dari daftar" },
        { status: 400 }
      );
    }

    let user;

    if (existing) {
      if (existing.role !== role) {
        return NextResponse.json(
          { error: "Email sudah terdaftar dengan peran berbeda" },
          { status: 409 }
        );
      }

      if (existing.passwordHash) {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 409 }
        );
      }

      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          ...(institutionId ? { institutionId } : {}),
        },
        select: { id: true, name: true, email: true, role: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          role: role as PortalRole,
          passwordHash,
          ...(institutionId ? { institutionId } : {}),
        },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    if (user.role === "STUDENT") {
      await ensureJournalWeeks(user.id);
    }

    const response = NextResponse.json(
      {
        user,
        redirectTo: getDashboardPath(user.role, user.id),
      },
      { status: 201 }
    );

    response.cookies.set(buildSessionCookie(createSessionForUser(user.id, user.role)));

    return response;
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat akun" },
      { status: 500 }
    );
  }
}
