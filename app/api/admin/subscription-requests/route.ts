import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";

type RequestRow = {
  id: string;
  months: number;
  note: string | null;
  status: string;
  decisionNote: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  institution: {
    id: string;
    name: string;
    subscriptionActive: boolean;
    subscriptionExpiresAt: Date | null;
  };
  requestedBy: { id: string; name: string | null; email: string | null };
};

function serialize(req: RequestRow) {
  return {
    id: req.id,
    months: req.months,
    note: req.note,
    status: req.status,
    decisionNote: req.decisionNote,
    decidedAt: req.decidedAt ? req.decidedAt.toISOString() : null,
    createdAt: req.createdAt.toISOString(),
    institution: {
      id: req.institution.id,
      name: req.institution.name,
      subscriptionActive: req.institution.subscriptionActive,
      subscriptionExpiresAt: req.institution.subscriptionExpiresAt
        ? req.institution.subscriptionExpiresAt.toISOString()
        : null,
    },
    requestedBy: {
      id: req.requestedBy.id,
      name: req.requestedBy.name,
      email: req.requestedBy.email,
    },
  };
}

const SELECT = {
  id: true,
  months: true,
  note: true,
  status: true,
  decisionNote: true,
  decidedAt: true,
  createdAt: true,
  institution: {
    select: {
      id: true,
      name: true,
      subscriptionActive: true,
      subscriptionExpiresAt: true,
    },
  },
  requestedBy: { select: { id: true, name: true, email: true } },
} as const;

// GET /api/admin/subscription-requests — semua pengajuan (PENDING dulu, lalu terbaru).
export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  try {
    const requests = await prisma.subscriptionRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: SELECT,
    });
    // status "asc": APPROVED, PENDING, REJECTED (alfabet) — kita ingin PENDING teratas.
    const order: Record<string, number> = { PENDING: 0, REJECTED: 1, APPROVED: 2 };
    const sorted = [...requests].sort(
      (a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9)
    );
    return NextResponse.json({ requests: sorted.map(serialize) });
  } catch (error) {
    console.error("GET SubscriptionRequests Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat pengajuan" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/subscription-requests
// body: { id, action: "APPROVE"|"REJECT", months?, decisionNote? }
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
  const action = body?.action === "REJECT" ? "REJECT" : body?.action === "APPROVE" ? "APPROVE" : null;
  if (!id || !action) {
    return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
  }
  const decisionNote =
    typeof body?.decisionNote === "string" && body.decisionNote.trim()
      ? body.decisionNote.trim()
      : null;

  try {
    const existing = await prisma.subscriptionRequest.findUnique({
      where: { id },
      select: { id: true, status: true, institutionId: true, requestedById: true, months: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }
    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "Pengajuan ini sudah diproses." },
        { status: 409 }
      );
    }

    const months =
      Number.isInteger(body?.months) && body.months > 0 ? body.months : existing.months;

    if (action === "APPROVE") {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Aktifkan langganan institusi + tandai pengajuan disetujui + notifikasi konselor.
      await prisma.$transaction([
        prisma.institution.update({
          where: { id: existing.institutionId },
          data: { subscriptionActive: true, subscriptionExpiresAt: expiresAt },
        }),
        prisma.subscriptionRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            months,
            decidedById: session.userId,
            decidedAt: new Date(),
            decisionNote,
          },
        }),
        prisma.notification.create({
          data: {
            userId: existing.requestedById,
            type: "SUBSCRIPTION_APPROVED",
            title: "Pengajuan langganan disetujui",
            body: `Langganan Premium institusi Anda telah diaktifkan hingga ${expiresAt.toLocaleDateString(
              "id-ID",
              { day: "numeric", month: "long", year: "numeric" }
            )}. Seluruh siswa kini memiliki akses Premium.`,
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.subscriptionRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            decidedById: session.userId,
            decidedAt: new Date(),
            decisionNote,
          },
        }),
        prisma.notification.create({
          data: {
            userId: existing.requestedById,
            type: "SUBSCRIPTION_REJECTED",
            title: "Pengajuan langganan ditolak",
            body: decisionNote
              ? `Pengajuan langganan Anda ditolak admin. Catatan: ${decisionNote}`
              : "Pengajuan langganan Anda ditolak admin. Silakan hubungi admin untuk info lebih lanjut.",
          },
        }),
      ]);
    }

    const updated = await prisma.subscriptionRequest.findUnique({
      where: { id },
      select: SELECT,
    });
    return NextResponse.json({ request: updated ? serialize(updated as RequestRow) : null });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses pengajuan" },
      { status: 500 }
    );
  }
}
