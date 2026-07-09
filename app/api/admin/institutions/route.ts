import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";

function serialize(inst: {
  id: string;
  name: string;
  subscriptionActive: boolean;
  subscriptionExpiresAt: Date | null;
  _count: { users: number };
}) {
  return {
    id: inst.id,
    name: inst.name,
    subscriptionActive: inst.subscriptionActive,
    subscriptionExpiresAt: inst.subscriptionExpiresAt
      ? inst.subscriptionExpiresAt.toISOString()
      : null,
    userCount: inst._count.users,
  };
}


export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        subscriptionActive: true,
        subscriptionExpiresAt: true,
        _count: { select: { users: true } },
      },
    });
    return NextResponse.json({ institutions: institutions.map(serialize) });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat institusi" }, { status: 500 });
  }
}


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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nama institusi wajib diisi" }, { status: 400 });
  }
  try {
    const created = await prisma.institution.create({
      data: { name },
      select: {
        id: true,
        name: true,
        subscriptionActive: true,
        subscriptionExpiresAt: true,
        _count: { select: { users: true } },
      },
    });
    return NextResponse.json({ institution: serialize(created) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat institusi" }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
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
  const active = body?.active !== false;
  const months = Number.isInteger(body?.months) ? body.months : 6;

  let expiresAt: Date | null = null;
  if (active) {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);
  }

  try {
    const updated = await prisma.institution.update({
      where: { id },
      data: { subscriptionActive: active, subscriptionExpiresAt: expiresAt },
      select: {
        id: true,
        name: true,
        subscriptionActive: true,
        subscriptionExpiresAt: true,
        _count: { select: { users: true } },
      },
    });
    return NextResponse.json({ institution: serialize(updated) });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui langganan" }, { status: 500 });
  }
}
