import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// POST /api/billing/upgrade  body: { studentId, plan? }
// MOCK: mengubah paket siswa. Untuk demo LIDM tanpa pembayaran nyata (roadmap).
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const studentId = typeof body?.studentId === "string" ? body.studentId : null;
  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  const plan = body?.plan === "FREE" ? "FREE" : "PREMIUM";

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: studentId },
      data: { plan },
      select: { id: true, plan: true },
    });

    return NextResponse.json({ ok: true, plan: updated.plan });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui paket" }, { status: 500 });
  }
}
