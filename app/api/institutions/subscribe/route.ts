import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// POST /api/institutions/subscribe  body: { institutionId, active, months? }
// MOCK: mengaktifkan/menonaktifkan langganan institusi (tanpa pembayaran nyata — roadmap).
// Saat aktif, langganan berlaku `months` bulan (default 6, ~1 semester).
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const institutionId =
    typeof body?.institutionId === "string" ? body.institutionId : null;
  if (!institutionId) {
    return NextResponse.json({ error: "Missing institutionId" }, { status: 400 });
  }

  const active = body?.active !== false; // default true
  const months = Number.isInteger(body?.months) ? body.months : 6;

  try {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });
    if (!institution) {
      return NextResponse.json({ error: "Institusi tidak ditemukan" }, { status: 404 });
    }

    let expiresAt: Date | null = null;
    if (active) {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
    }

    const updated = await prisma.institution.update({
      where: { id: institutionId },
      data: { subscriptionActive: active, subscriptionExpiresAt: expiresAt },
      select: {
        id: true,
        name: true,
        subscriptionActive: true,
        subscriptionExpiresAt: true,
      },
    });

    const studentCount = await prisma.user.count({
      where: { institutionId, role: "STUDENT" },
    });

    return NextResponse.json({
      institution: {
        ...updated,
        subscriptionExpiresAt: updated.subscriptionExpiresAt
          ? updated.subscriptionExpiresAt.toISOString()
          : null,
        studentCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui langganan" },
      { status: 500 }
    );
  }
}
