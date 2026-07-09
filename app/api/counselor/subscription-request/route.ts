import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";


function serialize(req: {
  id: string;
  months: number;
  note: string | null;
  status: string;
  decisionNote: string | null;
  decidedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: req.id,
    months: req.months,
    note: req.note,
    status: req.status,
    decisionNote: req.decisionNote,
    decidedAt: req.decidedAt ? req.decidedAt.toISOString() : null,
    createdAt: req.createdAt.toISOString(),
  };
}



export async function GET(request: NextRequest) {
  const session = requireRole(request, "COUNSELOR");
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
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

    if (!me?.institutionId || !me.institution) {
      return NextResponse.json({ institution: null, requests: [] });
    }

    const requests = await prisma.subscriptionRequest.findMany({
      where: { institutionId: me.institutionId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        months: true,
        note: true,
        status: true,
        decisionNote: true,
        decidedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      institution: {
        id: me.institution.id,
        name: me.institution.name,
        subscriptionActive: me.institution.subscriptionActive,
        subscriptionExpiresAt: me.institution.subscriptionExpiresAt
          ? me.institution.subscriptionExpiresAt.toISOString()
          : null,
      },
      requests: requests.map(serialize),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat data pengajuan" },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  const session = requireRole(request, "COUNSELOR");
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const note =
    typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;
  const months = Number.isInteger(body?.months) && body.months > 0 ? body.months : 6;

  try {
    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        institutionId: true,
        institution: {
          select: { subscriptionActive: true, subscriptionExpiresAt: true },
        },
      },
    });

    if (!me?.institutionId || !me.institution) {
      return NextResponse.json(
        { error: "Akun Anda belum tertaut dengan institusi." },
        { status: 400 }
      );
    }

    
    const inst = me.institution;
    const stillActive =
      inst.subscriptionActive &&
      (!inst.subscriptionExpiresAt ||
        inst.subscriptionExpiresAt.getTime() > Date.now());
    if (stillActive) {
      return NextResponse.json(
        { error: "Institusi Anda sudah berlangganan aktif." },
        { status: 409 }
      );
    }

    
    const pending = await prisma.subscriptionRequest.findFirst({
      where: { institutionId: me.institutionId, status: "PENDING" },
      select: { id: true },
    });
    if (pending) {
      return NextResponse.json(
        { error: "Sudah ada pengajuan yang sedang menunggu persetujuan admin." },
        { status: 409 }
      );
    }

    const created = await prisma.subscriptionRequest.create({
      data: {
        institutionId: me.institutionId,
        requestedById: session.userId,
        months,
        note,
      },
      select: {
        id: true,
        months: true,
        note: true,
        status: true,
        decisionNote: true,
        decidedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ request: serialize(created) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengirim pengajuan" },
      { status: 500 }
    );
  }
}
