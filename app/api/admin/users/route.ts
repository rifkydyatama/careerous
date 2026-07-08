import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";

// GET /api/admin/users — daftar semua pengguna (admin only).
export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        institution: { select: { id: true, name: true } },
        _count: { select: { journalProgress: true } },
      },
    });

    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plan: u.plan,
        createdAt: u.createdAt.toISOString(),
        institution: u.institution,
      })),
      institutions,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat pengguna" }, { status: 500 });
  }
}

// PATCH /api/admin/users — ubah role / plan / institusi. body: { id, role?, plan?, institutionId? }
export async function PATCH(request: NextRequest) {
  const session = requireRole(request, "ADMIN");
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const data: { role?: any; plan?: any; institutionId?: string | null } = {};
  if (body?.role && ["STUDENT", "COUNSELOR", "ADMIN"].includes(body.role)) {
    data.role = body.role;
  }
  if (body?.plan && ["FREE", "PREMIUM"].includes(body.plan)) {
    data.plan = body.plan;
  }
  if (body?.institutionId !== undefined) {
    data.institutionId = body.institutionId || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        role: true,
        plan: true,
        institution: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=... — hapus pengguna.
export async function DELETE(request: NextRequest) {
  const session = requireRole(request, "ADMIN");
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (id === session.userId) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus akun sendiri" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
